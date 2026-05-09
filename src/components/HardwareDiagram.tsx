import hardwareIoUrl from '../assets/hardware-io.svg';

export default function HardwareDiagram() {
  return (
    <div className="hardware-diagram">
      <h3>Hardware Architecture</h3>
      <img
        src={hardwareIoUrl}
        alt="Hardware I/O: Disk Read Path"
        style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}
