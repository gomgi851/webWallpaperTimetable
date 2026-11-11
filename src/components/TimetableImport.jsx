import React, {useEffect, useRef, useState} from 'react';
import {getAutomaticImport} from '../lib/timetable-ocr/import-courses';
import './TimetableImport.css';

export default function TimetableImport({onImport}) {
  const [busy,setBusy]=useState(false),[progress,setProgress]=useState(null);
  const [error,setError]=useState('');
  const workerRef=useRef(null),busyRef=useRef(false),dialogRef=useRef(null),fileInputRef=useRef(null),requestRef=useRef(0);
  useEffect(()=>()=>{requestRef.current++;workerRef.current?.terminate();},[]);
  useEffect(()=>{if(error&&!dialogRef.current.open)dialogRef.current.showModal();else if(!error&&dialogRef.current.open)dialogRef.current.close();},[error]);
  function finish(){busyRef.current=false;setBusy(false);}
  function fail(message){finish();setProgress(null);setError(message);}
  async function chooseFile(next){
    if(!next||busyRef.current)return;
    if(!/^image\/(png|jpeg|webp)$/.test(next.type)||next.size>20*1024*1024){setError('PNG/JPG/WEBP 사진을 20MB 이하로 선택해주세요.');return;}
    const request=++requestRef.current;
    busyRef.current=true;setBusy(true);setProgress(0);setError('');
    try{
      const bitmap=await createImageBitmap(next),tooBig=bitmap.width*bitmap.height>16_000_000;bitmap.close();
      if(request!==requestRef.current)return;
      if(tooBig)throw new Error('1,600만 픽셀 이하 사진을 선택해주세요.');
      run(next);
    }catch(e){if(request===requestRef.current)fail(`사진을 읽지 못했습니다. ${e.message}`);}
  }
  function run(imageFile){
    if(!window.Worker||!window.OffscreenCanvas){fail('이 브라우저는 사진 인식을 지원하지 않습니다. 수업 정보를 직접 입력해주세요.');return;}
    try{
      if(!workerRef.current){
        const worker=new Worker(new URL('../lib/timetable-ocr/ocr-worker.js',import.meta.url),{type:'module'});workerRef.current=worker;
        worker.onmessage=({data})=>{
          if(data.type==='progress')setProgress(previous=>Math.max(previous??0,Math.min(99,Math.floor(data.overallProgress||0))));
          else if(data.type==='error'){worker.terminate();workerRef.current=null;fail('시간표 인식에 실패했습니다. 수업 정보를 직접 입력해주세요.');}
          else if(data.type==='result'){
            try{const courses=getAutomaticImport(data.result.classes);onImport(courses,'replace');finish();setProgress(100);}
            catch(e){fail(e.message);}
          }
        };
        worker.onerror=()=>{worker.terminate();workerRef.current=null;fail('시간표 인식에 실패했습니다. 수업 정보를 직접 입력해주세요.');};
      }
      workerRef.current.postMessage({file:imageFile,startHour:null});
    }catch{workerRef.current?.terminate();workerRef.current=null;fail('시간표 인식에 실패했습니다. 수업 정보를 직접 입력해주세요.');}
  }
  function cancel(){requestRef.current++;workerRef.current?.terminate();workerRef.current=null;finish();setProgress(null);}
  return <section className="timetable-import" aria-label="시간표 사진에서 가져오기">
    <div className="import-header">
      <div className="import-heading"><h4>시간표 사진에서 가져오기</h4><span>에브리타임 · AI 인식</span></div>
      <button type="button" className="bg-file-label" data-ui-action="timetable" disabled={busy} onClick={()=>fileInputRef.current.click()}>파일 선택</button>
          <input hidden ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="인식할 시간표 사진" disabled={busy} onChange={e=>{chooseFile(e.target.files[0]);e.target.value='';}}/>
    </div>
    <div className={`import-body${progress!==null?' has-progress':''}`}>
      {progress!==null&&<div className={`import-progress${progress===100?' is-complete':''}`}><progress aria-label="시간표 인식 진행률" max="100" value={progress}/><span aria-live="polite">{progress}%</span></div>}
      {busy&&<button type="button" className="bg-file-label import-cancel" onClick={cancel}>인식 취소</button>}
      <dialog className="import-error" ref={dialogRef} onCancel={()=>setError('')} aria-labelledby="import-error-title" aria-describedby="import-error-message"><h4 id="import-error-title">시간표 인식 실패</h4><p id="import-error-message">{error}</p><button type="button" className="bg-file-label" onClick={()=>setError('')}>확인</button></dialog>
    </div>
  </section>;
}
