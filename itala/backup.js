function exportITalaBackup(){
  const payload={app:'iTala',formatVersion:1,exportedAt:new Date().toISOString(),activeProfileId,data:store};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=`itala-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  toast('Backup exported ✓');
}

async function importITalaBackup(input){
  const file=input.files?.[0];if(!file)return;
  try{
    const payload=JSON.parse(await file.text()),incoming=payload?.data??payload;
    if(incoming?.version!==2||!Array.isArray(incoming.profiles)||!incoming.profiles.length)throw new Error('Invalid iTala backup');
    const count=incoming.profiles.length;
    if(!confirm(`Import ${count} iTala profile${count===1?'':'s'} and replace any data currently stored on this domain?`))return;
    localStorage.setItem(KEY,JSON.stringify(incoming));
    const requested=payload?.activeProfileId;
    localStorage.setItem(ACTIVE_KEY,incoming.profiles.some(p=>p.id===requested)?requested:incoming.profiles[0].id);
    if(!localStorage.getItem(KEY))throw new Error('Backup could not be saved');
    alert(`Backup imported successfully. ${count} profile${count===1?' was':'s were'} restored.`);
    location.reload();
  }catch(error){alert('The backup could not be imported. Please select the iTala JSON backup file you downloaded.');}
  finally{input.value='';}
}
