"use client";

import "./dietician.css";
import { useState } from "react";

export default function DieticianPage(){

const [form,setForm]=useState({
name:"",
email:"",
problem:"",
date:""
})

const handleChange=(e:any)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit=(e:any)=>{
e.preventDefault()
alert("Consultation booked successfully!")
}

return(

<div className="dietician-page">

<h1 className="dietician-title">
Dietician Consultation
</h1>

<p className="dietician-desc">
Connect with certified nutrition experts and book a consultation
to improve your diet and health.
</p>

<form className="booking-form" onSubmit={handleSubmit}>

<input
type="text"
name="name"
placeholder="Your Name"
required
onChange={handleChange}
/>

<input
type="email"
name="email"
placeholder="Your Email"
required
onChange={handleChange}
/>

<textarea
name="problem"
placeholder="Describe your diet or health issue"
required
onChange={handleChange}
/>

<input
type="date"
name="date"
required
onChange={handleChange}
/>

<button type="submit">
Book Consultation
</button>

</form>

</div>

)
}