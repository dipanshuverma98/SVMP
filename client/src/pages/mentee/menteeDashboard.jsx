export default function MenteeDashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Mentee Learning Area</h1>
      
      <section>
        <h3>Resource Library</h3>
        <ul>
          <li><a href="https://drive.google.com/..." target="_blank">React Basics PDF</a></li>
        </ul>
      </section>

      <section>
        <h3>Active Meetings</h3>
        <button onClick={() => window.location.href='/video-call/group123'}>
          Join Mentor's Meeting
        </button>
      </section>
    </div>
  );
}