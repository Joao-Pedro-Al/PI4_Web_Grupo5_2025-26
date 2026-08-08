async function testCreate() {
  const res = await fetch('http://localhost:3000/api/consultas/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      medico: 'Dra. Maria Santos',
      idutilizadorprefil: 2,
      tipomarcacao: 1,
      data: '2026-08-08',
      hora: '16:00:00',
      horaFim: '17:30:00',
      numerotelemovel: '961234567',
      detalhes: 'Limpeza Dentaria'
    })
  });
  const d = await res.json();
  console.log('Success:', d.success);
  console.log('Mensagem:', d.message || d.error);
  if (d.data) {
    console.log('hora:', d.data.hora);
    console.log('horaFim:', d.data.horaFim);
    console.log('data:', d.data.data);
  }
}
testCreate();
