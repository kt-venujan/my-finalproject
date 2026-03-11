import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>SmartDiet Hub</h1>
      <p>AI Assisted Diet Planning Platform</p>

      <Link href="/login">Login</Link>
      <br />
      <Link href="/register">Register</Link>
    </div>
  );
}