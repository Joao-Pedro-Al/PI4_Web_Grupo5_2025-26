// src/view/PaginaInicial.jsx - Modal ao clicar na agenda
import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import '../style.css';
import './paginainicial.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaginaInicial = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para dados
  const [doctors, setDoctors] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const calendarRef = useRef(null);

  const consultationTypes = ['Consulta Dentária', 'Urgência', 'Limpeza', 'Extração', 'Check-up', 'Ortodontia'];

  // Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    doctor: '',
    consultationType: '',
    phoneNumber: '',
    // info do slot selecionado
    slotStart: null,
    slotEnd: null,
  });
  const [modalError, setModalError] = useState('');

  // Carregar médicos e pacientes da API
  useEffect(() => {
    carregarMedicos();
    carregarPacientes();
  }, []);

  const carregarMedicos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/teste-perfis');
      const data = await response.json();

      if (data.success && data.contas) {
        const contasMedicos = data.contas.filter(conta => conta.idtipoconta === 2);
        const medicosComDetalhes = [];

        for (const contaMedico of contasMedicos) {
          try {
            if (contaMedico.idutilizadorprefil) {
              const perfilResponse = await fetch(`http://localhost:3000/api/utilizadorperfil/list/${contaMedico.idutilizadorprefil}`);
              const perfilData = await perfilResponse.json();

              if (perfilData.success && perfilData.data && perfilData.data.length > 0) {
                const perfil = perfilData.data[0];
                medicosComDetalhes.push({
                  id: `med${contaMedico.idconta}`,
                  title: perfil.nome || contaMedico.username || `Médico ${contaMedico.idconta}`,
                  nomeCompleto: perfil.nome || contaMedico.username || `Médico ${contaMedico.idconta}`,
                  idConta: contaMedico.idconta,
                  idPerfil: contaMedico.idutilizadorprefil,
                  color: ['#b79b53', '#27ae60', '#2980b9', '#9b59b6'][medicosComDetalhes.length % 4],
                  tipo: 'Médico'
                });
              } else {
                medicosComDetalhes.push({
                  id: `med${contaMedico.idconta}`,
                  title: contaMedico.username || `Médico ${contaMedico.idconta}`,
                  nomeCompleto: contaMedico.username || `Médico ${contaMedico.idconta}`,
                  idConta: contaMedico.idconta,
                  idPerfil: contaMedico.idutilizadorprefil,
                  color: ['#b79b53', '#27ae60', '#2980b9', '#9b59b6'][medicosComDetalhes.length % 4],
                  tipo: 'Médico'
                });
              }
            } else {
              medicosComDetalhes.push({
                id: `med${contaMedico.idconta}`,
                title: contaMedico.username || `Médico ${contaMedico.idconta}`,
                nomeCompleto: contaMedico.username || `Médico ${contaMedico.idconta}`,
                idConta: contaMedico.idconta,
                idPerfil: null,
                color: ['#b79b53', '#27ae60', '#2980b9', '#9b59b6'][medicosComDetalhes.length % 4],
                tipo: 'Médico'
              });
            }
          } catch (error) {
            console.error(`Erro ao buscar perfil do médico ${contaMedico.idconta}:`, error);
          }
        }

        if (medicosComDetalhes.length > 0) {
          setDoctors(medicosComDetalhes);
        } else {
          setDoctors([
            { id: 'med1', title: 'Dr. Carlos Mendes', nomeCompleto: 'Dr. Carlos Mendes', color: '#b79b53', tipo: 'Médico' },
            { id: 'med2', title: 'Dra. Ana Costa', nomeCompleto: 'Dra. Ana Costa', color: '#27ae60', tipo: 'Médico' },
            { id: 'med3', title: 'Dr. Miguel Santos', nomeCompleto: 'Dr. Miguel Santos', color: '#2980b9', tipo: 'Médico' }
          ]);
        }
      } else {
        setDoctors([
          { id: 'med1', title: 'Dr. Carlos Mendes', nomeCompleto: 'Dr. Carlos Mendes', color: '#b79b53', tipo: 'Médico' },
          { id: 'med2', title: 'Dra. Ana Costa', nomeCompleto: 'Dra. Ana Costa', color: '#27ae60', tipo: 'Médico' },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setDoctors([
        { id: 'med1', title: 'Dr. Carlos Mendes', nomeCompleto: 'Dr. Carlos Mendes', color: '#b79b53', tipo: 'Médico' },
        { id: 'med2', title: 'Dra. Ana Costa', nomeCompleto: 'Dra. Ana Costa', color: '#27ae60', tipo: 'Médico' }
      ]);
    }
  };

  const carregarPacientes = async () => {
    try {
      const responseContas = await fetch('http://localhost:3000/api/teste-perfis');
      const dataContas = await responseContas.json();

      if (dataContas.success && dataContas.contas) {
        const contasPacientes = dataContas.contas.filter(conta => conta.idtipoconta === 1);
        const pacientesComDetalhes = [];

        for (const contaPaciente of contasPacientes) {
          if (contaPaciente.idutilizadorprefil) {
            try {
              const perfilResponse = await fetch(`http://localhost:3000/api/utilizadorperfil/list/${contaPaciente.idutilizadorprefil}`);
              const perfilData = await perfilResponse.json();

              if (perfilData.success && perfilData.data && perfilData.data.length > 0) {
                const perfil = perfilData.data[0];
                pacientesComDetalhes.push({
                  idutilizadorprefil: contaPaciente.idutilizadorprefil,
                  nome: perfil.nome || contaPaciente.username,
                  contactoprincipal: perfil.contactoprincipal,
                  gmail: perfil.gmail,
                  idconta: contaPaciente.idconta,
                });
              }
            } catch (error) {
              console.error(`Erro ao buscar perfil do paciente ${contaPaciente.idconta}:`, error);
            }
          }
        }

        setPacientes(pacientesComDetalhes);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const buscarPacientePorTelefone = (telefone) => {
    if (!telefone || telefone.trim() === '') return null;
    const telProcurado = telefone.toString().replace(/\D/g, '');

    for (const paciente of pacientes) {
      const telNormalizado = (paciente.contactoprincipal?.toString() || '').replace(/\D/g, '');
      if (telNormalizado === telProcurado || telNormalizado.includes(telProcurado) || telProcurado.includes(telNormalizado)) {
        return { id: paciente.idutilizadorprefil, nome: paciente.nome, telefone: paciente.contactoprincipal, email: paciente.gmail, idconta: paciente.idconta };
      }
    }
    return null;
  };

  const isDoctorAvailable = (doctorId, start, end) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return true;
    const events = calendarApi.getEvents();
    return !events.some(event => {
      const eventDoctorId = event.extendedProps?.resourceId || event.extendedProps?.doctorId;
      return eventDoctorId === doctorId &&
        ((start >= event.start && start < event.end) ||
         (end > event.start && end <= event.end) ||
         (start <= event.start && end >= event.end));
    });
  };

  // Abrir modal ao selecionar slot no calendário
  const handleSelect = (info) => {
    const startDate = info.start;
    const endDate = info.end;

    const dateStr = startDate.toISOString().split('T')[0];
    const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    setModalData({
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      doctor: doctors.length > 0 ? doctors[0].id : '',
      consultationType: consultationTypes[0],
      phoneNumber: '',
      slotStart: startDate,
      slotEnd: endDate,
    });
    setModalError('');
    setShowModal(true);
  };

  // Confirmar consulta pelo modal
  const handleConfirmarModal = () => {
    setModalError('');

    if (!modalData.doctor || !modalData.consultationType || !modalData.phoneNumber) {
      setModalError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const paciente = buscarPacientePorTelefone(modalData.phoneNumber);
    if (!paciente) {
      const lista = pacientes.map(p => `• ${p.nome}: ${p.contactoprincipal || 'Sem telefone'}`).join('\n');
      setModalError(`Paciente não encontrado.\nPacientes disponíveis:\n${lista}`);
      return;
    }

    const doctor = doctors.find(d => d.id === modalData.doctor);
    if (!doctor) {
      setModalError('Médico não encontrado.');
      return;
    }

    // Recalcular horário a partir dos campos do modal (podem ter sido editados)
    const [startH, startM] = modalData.startTime.split(':').map(Number);
    const [endH, endM] = modalData.endTime.split(':').map(Number);
    const startDateTime = new Date(`${modalData.date}T${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}:00`);
    const endDateTime = new Date(`${modalData.date}T${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}:00`);

    if (!isDoctorAvailable(doctor.id, startDateTime, endDateTime)) {
      setModalError(`O ${doctor.title} já está ocupado nesse horário!`);
      return;
    }

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.addEvent({
        title: `${paciente.nome} — ${modalData.consultationType}`,
        start: startDateTime,
        end: endDateTime,
        resourceId: doctor.id,
        color: doctor.color,
        extendedProps: {
          pacienteId: paciente.id,
          pacienteNome: paciente.nome,
          telefone: paciente.telefone,
          tipoConsulta: modalData.consultationType,
          medico: doctor.title,
          medicoId: doctor.idConta,
          resourceId: doctor.id,
        }
      });

      setShowModal(false);
    }
  };

  // Clique num evento existente
  const handleEventClick = (info) => {
    const { pacienteNome, tipoConsulta, medico, telefone } = info.event.extendedProps;
    const start = info.event.start ? info.event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';
    const end = info.event.end ? info.event.end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';

    const confirmed = window.confirm(
      `📋 Detalhes da Consulta:\n\n👤 Paciente: ${pacienteNome || info.event.title}\n📞 Telefone: ${telefone || 'N/A'}\n🩺 Médico: ${medico || 'N/A'}\n📝 Tipo: ${tipoConsulta || 'N/A'}\n⏰ Horário: ${start} — ${end}\n\nPretende remover esta consulta?`
    );
    if (confirmed) {
      info.event.remove();
    }
  };

  const handleDoctorFilterChange = (e) => {
    const selected = e.target.value;
    setSelectedDoctor(selected);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.getEvents().forEach(event => {
        if (selected === 'all') {
          event.setProp('display', 'auto');
        } else {
          const eventDoctorId = event.extendedProps?.resourceId || event.extendedProps?.doctorId;
          event.setProp('display', eventDoctorId === selected ? 'auto' : 'none');
        }
      });
    }
  };

  // Estilos do FullCalendar injectados
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .fc-toolbar-title { color: #A99C5E; font-size: 22px; }
      .fc-button { background-color: #A99C5E !important; border: none !important; color: white !important; font-weight: bold !important; }
      .fc-button:hover { background-color: #8a7542 !important; }
      .fc-col-header-cell { background-color: #f8f9fa; color: #A99C5E; font-weight: bold; }
      .fc-day-today { background-color: rgba(183,155,83,0.1) !important; }
      .fc-highlight { background: rgba(183,155,83,0.25) !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="pagina-inicial">

      {/* Cabeçalho médico */}
      <div style={{ backgroundColor: '#f0f7ff', border: '2px solid #A99C5E', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#A99C5E', marginBottom: '10px' }}>
              <i className="bi bi-person-badge"></i> Bem-vindo, Dr(a). {user?.nome}!
            </h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div><strong>🩺 ID Conta:</strong> {user?.id}</div>
              <div><strong>📧 Email:</strong> {user?.email}</div>
              <div><strong>🎫 Tipo:</strong> Médico</div>
              <div><strong>💼 Especialidade:</strong> {user?.especialidade || 'Dentista'}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/backoffice/notificacoes/')}
            style={{ backgroundColor: '#A99C5E', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}
          >
            <i className="bi bi-bell-fill"></i> Ver Notificações
          </button>
        </div>
      </div>

      <h2 className="titulo">Agendamentos Clínica Dentária</h2>

      {/* Dica de uso */}
      <div style={{ backgroundColor: '#fffbf0', border: '1px solid #A99C5E', borderRadius: '8px', padding: '10px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#7a6930' }}>
        <i className="bi bi-info-circle-fill" style={{ fontSize: '18px', color: '#A99C5E' }}></i>
        <span><strong>Como marcar uma consulta:</strong> Clique e arraste sobre um horário na agenda para o selecionar — um formulário irá aparecer automaticamente.</span>
      </div>

      {/* Filtro de médico */}
      <div id="doctor-filter" className="mb-3">
        <label className="me-2"><strong>Filtrar por médico:</strong></label>
        <select id="doctorSelect" className="form-select d-inline-block w-auto" value={selectedDoctor} onChange={handleDoctorFilterChange}>
          <option value="all">Todos</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.title}</option>
          ))}
        </select>
      </div>

      {/* Calendário */}
      <div id="calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,today,next', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          locale={ptLocale}
          selectable={true}
          nowIndicator={true}
          editable={true}
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          allDaySlot={false}
          select={handleSelect}
          eventClick={handleEventClick}
          events={[]}
          height="auto"
        />
      </div>

      {/* ===== MODAL DE MARCAÇÃO ===== */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px',
            width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            {/* Header do modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ color: '#A99C5E', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  <i className="bi bi-calendar-plus"></i> Marcar Consulta
                </h3>
                <p style={{ color: '#999', margin: '4px 0 0 0', fontSize: '13px' }}>
                  📅 {new Date(modalData.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer',
                color: '#999', width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }} onMouseOver={e => e.target.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.target.style.backgroundColor = 'transparent'}>
                ×
              </button>
            </div>

            {/* Horário */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>⏰ Hora Início</label>
                <input type="time" value={modalData.startTime}
                  onChange={e => setModalData(prev => ({ ...prev, startTime: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>⏱ Hora Fim</label>
                <input type="time" value={modalData.endTime}
                  onChange={e => setModalData(prev => ({ ...prev, endTime: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            {/* Médico */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>🩺 Médico</label>
              <select value={modalData.doctor}
                onChange={e => setModalData(prev => ({ ...prev, doctor: e.target.value }))}
                style={inputStyle}>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Consulta */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>📋 Tipo de Consulta</label>
              <select value={modalData.consultationType}
                onChange={e => setModalData(prev => ({ ...prev, consultationType: e.target.value }))}
                style={inputStyle}>
                {consultationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Telefone do Paciente */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>📞 Telemóvel do Paciente</label>
              <input
                type="text"
                placeholder="ex: 912345678"
                value={modalData.phoneNumber}
                onChange={e => setModalData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                style={inputStyle}
                list="modal-pacientes-telefones"
              />
              <datalist id="modal-pacientes-telefones">
                {pacientes.map((p, i) => (
                  <option key={i} value={p.contactoprincipal || ''}>{p.nome}</option>
                ))}
              </datalist>
              {pacientes.length > 0 && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                  Pacientes: {pacientes.map(p => `${p.nome} (${p.contactoprincipal || 'sem tel.'})`).join(' • ')}
                </div>
              )}
            </div>

            {/* Erro */}
            {modalError && (
              <div style={{ backgroundColor: '#fff3f3', border: '1px solid #ffaaaa', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#c0392b', fontSize: '13px', whiteSpace: 'pre-line' }}>
                ❌ {modalError}
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleConfirmarModal} style={{
                flex: 1, padding: '13px', backgroundColor: '#A99C5E', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#8a7542'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#A99C5E'}
              >
                <i className="bi bi-check-circle-fill"></i> Confirmar
              </button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '13px', backgroundColor: 'white', color: '#A99C5E',
                border: '2px solid #A99C5E', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f9f5ec'; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'white'; }}
              >
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos reutilizáveis para o modal
const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#555',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1.5px solid #ddd',
  fontSize: '14px',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default PaginaInicial;