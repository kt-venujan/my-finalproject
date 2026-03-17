// i use this file contact page send message to the admin and admin can see the message in the dashboard
"use client";

import { useEffect, useState } from "react";

export default function AdminMessages(){

const [messages,setMessages] = useState<any[]>([]);

useEffect(()=>{

fetch("http://localhost:5000/api/contact/all")
.then(res=>res.json())
.then(data=>setMessages(data));

},[]);

return(

<div style={{padding:"40px"}}>

<h1>Contact Messages</h1>

{messages.map((m)=>(
<div key={m._id} style={{marginBottom:"20px"}}>

<h3>{m.name}</h3>
<p>{m.email}</p>
<p>{m.message}</p>

<hr/>

</div>
))}

</div>

);
}