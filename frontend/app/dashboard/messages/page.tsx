// i use this file contact page send message to the admin and admin can see the message in the dashboard
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function AdminMessages(){

const [messages,setMessages] = useState<any[]>([]);

useEffect(()=>{

api.get("/contact/all")
.then((res)=>setMessages(res.data || []));

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