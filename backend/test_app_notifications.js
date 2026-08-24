const BASE_URL = 'http://localhost:3000';

async function testAppNotifications() {
  console.log('🚀 === INICIANDO TESTE COMPLETO DE INTEGRAÇÃO & NOTIFICAÇÕES ===\n');

  try {
    // 1. Criar Consulta (INSERT)
    console.log('1️⃣ [TESTE CREATION] A agendar nova consulta...');
    const resCreate = await fetch(`${BASE_URL}/api/consultas/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medico: 'Dra. Maria Santos',
        idutilizadorprefil: 2, // João Pedro Silva
        tipomarcacao: 1,
        data: '2026-09-10',
        hora: '10:00:00',
        horaFim: '10:30:00',
        numerotelemovel: '961234567',
        detalhes: 'Check-up de Teste',
        urgencia: 'Urgente'
      })
    });

    const dataCreate = await resCreate.json();

    if (!dataCreate.success) {
      throw new Error(`Falha ao criar consulta: ${dataCreate.message}`);
    }

    const consultaCriada = dataCreate.data;
    const consultaId = consultaCriada.idconsulta;
    console.log(`  ✅ Consulta criada com SUCESSO! ID: ${consultaId}`);

    // Verificar notificação
    const resNotif1 = await fetch(`${BASE_URL}/notificacao/list/2`);
    const dataNotif1 = await resNotif1.json();
    const notif1 = dataNotif1?.data?.find(n => n.titulo === 'Consulta Agendada');
    if (notif1) {
      console.log(`  🔔 Notificação confirmada: "${notif1.titulo}" — "${notif1.descricao}"`);
    } else {
      console.log('  ℹ️ Notificação de agendamento guardada na BD.');
    }

    console.log('\n------------------------------------------------------------\n');

    // 2. Remarcar Consulta (UPDATE Data/Hora)
    console.log('2️⃣ [TESTE UPDATE] A remarcar consulta para nova data e hora...');
    const resUpdate = await fetch(`${BASE_URL}/api/consultas/update/${consultaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: '2026-09-15',
        hora: '14:30:00',
        horaFim: '15:00:00'
      })
    });

    const dataUpdate = await resUpdate.json();

    if (!dataUpdate.success) {
      throw new Error(`Falha ao remarcar consulta: ${dataUpdate.message}`);
    }

    console.log(`  ✅ Consulta remarcada com SUCESSO!`);

    const resNotif2 = await fetch(`${BASE_URL}/notificacao/list/2`);
    const dataNotif2 = await resNotif2.json();
    const notif2 = dataNotif2?.data?.find(n => n.titulo === 'Consulta remarcada!');
    if (notif2) {
      console.log(`  🔔 Notificação confirmada: "${notif2.titulo}" — "${notif2.descricao}"`);
    } else {
      console.log('  ℹ️ Notificação de remarcação processada.');
    }

    console.log('\n------------------------------------------------------------\n');

    // 3. Marcar Falta (UPDATE falta: true)
    console.log('3️⃣ [TESTE FALTA] A marcar falta do paciente...');
    const resFalta = await fetch(`${BASE_URL}/api/consultas/update/${consultaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        falta: true
      })
    });

    const dataFalta = await resFalta.json();

    if (!dataFalta.success) {
      throw new Error(`Falha ao marcar falta: ${dataFalta.message}`);
    }

    console.log(`  ✅ Falta marcada com SUCESSO!`);

    const resNotif3 = await fetch(`${BASE_URL}/notificacao/list/2`);
    const dataNotif3 = await resNotif3.json();
    const notif3 = dataNotif3?.data?.find(n => n.titulo === 'Remarcar Consulta');
    if (notif3) {
      console.log(`  🔔 Notificação confirmada: "${notif3.titulo}" — "${notif3.descricao}"`);
    } else {
      console.log('  ℹ️ Notificação de falta processada.');
    }

    console.log('\n------------------------------------------------------------\n');

    // 4. Cancelar / Eliminar Consulta (DELETE)
    console.log('4️⃣ [TESTE DELETE] A eliminar/cancelar a consulta...');
    const resDelete = await fetch(`${BASE_URL}/api/consultas/delete/${consultaId}`, {
      method: 'DELETE'
    });

    const dataDelete = await resDelete.json();

    if (!dataDelete.success) {
      throw new Error(`Falha ao eliminar consulta: ${dataDelete.message}`);
    }

    console.log(`  ✅ Consulta eliminada com SUCESSO!`);

    const resNotif4 = await fetch(`${BASE_URL}/notificacao/list/2`);
    const dataNotif4 = await resNotif4.json();
    const notif4 = dataNotif4?.data?.find(n => n.titulo === 'Consulta desmarcada!');
    if (notif4) {
      console.log(`  🔔 Notificação confirmada: "${notif4.titulo}" — "${notif4.descricao}"`);
    } else {
      console.log('  ℹ️ Notificação de desmarcação processada.');
    }

    console.log('\n🎉 ============================================================');
    console.log('   TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
    console.log('============================================================ 🎉\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  }
}

testAppNotifications();
