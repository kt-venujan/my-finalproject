"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import "./contact.css";

export default function ContactPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/contact/send",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name,
          email,
          message
        })
      });

      const data = await res.json();

      if(data.success){
        alert("Message sent successfully!");

        setName("");
        setEmail("");
        setMessage("");
      }

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }

  };

  return (
    <>
      <Navbar />

      <div className="contact-page">

        <div className="contact-container">

          {/* LEFT SIDE */}
          <div className="contact-left">
            <h1>Contact Us</h1>

            <p>
              We would love to hear from you. Feel free to complete the contact
              form or use the details below:
            </p>

            <div className="contact-details">
              <div>
                <span>Email</span>
                <p>support@smartdiethub.com</p>
              </div>

              <div>
                <span>Phone</span>
                <p>+94 77 123 4567</p>
              </div>

              <div>
                <span>Location</span>
                <p>Colombo, Sri Lanka</p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="contact-right">

            <div className="form-row">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>

            <textarea
              placeholder="Message"
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
            ></textarea>

            <button className="send-btn" onClick={sendMessage}>
              Send Message
            </button>

          </div>

        </div>

        {/* FOOD IMAGES */}
        <div className="food-gallery">
          <img src="/food1.jpg" />
          <img src="/food2.jpg" />
          <img src="/food3.jpg" />
          <img src="/food4.jpg" />
        </div>

      </div>
    </>
  );
}