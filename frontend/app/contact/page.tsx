"use client";

import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import "./contact.css";

export default function ContactPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return toast.error("Please fill in all fields");
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return toast.error("Please enter a valid email address");
    }

    try {
      setSending(true);

      const res = await api.post("/contact/send", {
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
      });

      const data = res.data;

      if(data.success){
        toast.success("Message sent successfully!");

        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      toast.error(data?.message || "Unable to send message");

    } catch (error: unknown) {
      let serverMessage: string | undefined;

      if (isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        serverMessage = responseData?.message || responseData?.error;
      }

      toast.error(serverMessage || "Something went wrong");
    } finally {
      setSending(false);
    }

  };

  return (
    <>
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
                <p>Dietara@gmail.com</p>
              </div>

              <div>
                <span>Phone</span>
                <p>+94 77 123 4567</p>
              </div>

              <div>
                <span>Location</span>
                <p>jaffna, Sri Lanka</p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form className="contact-right" onSubmit={sendMessage}>

            <div className="form-row">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                disabled={sending}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                disabled={sending}
              />
            </div>

            <textarea
              placeholder="Message"
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              disabled={sending}
            />

            <button className="send-btn" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

        {/* FOOD IMAGES */}
        <div className="food-gallery">
          <img src="/food1.jpg" alt="Healthy meal preview 1" />
          <img src="/food2.jpg" alt="Healthy meal preview 2" />
          <img src="/food3.jpg" alt="Healthy meal preview 3" />
          <img src="/food4.jpg" alt="Healthy meal preview 4" />
        </div>

      </div>
    </>
  );
}