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

  return (
    <div className="pagina-inicial">

      {/* Cabeçalho médico */}
      <div className="welcome-card">
        <div className="welcome-card__row">
          <div>
            <h3 className="welcome-card__title">
              <i className="bi bi-person-badge"></i> Bem-vindo, Dr(a). {user?.nome}!
            </h3>
            <div className="welcome-card__meta">
              <div><strong>🩺 ID Conta:</strong> {user?.id}</div>
              <div><strong>📧 Email:</strong> {user?.email}</div>
              <div><strong>🎫 Tipo:</strong> Médico</div>
              <div><strong>💼 Especialidade:</strong> {user?.especialidade || 'Dentista'}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/backoffice/notificacoes/')}
            className="btn-notifications"
          >
            <i className="bi bi-bell-fill"></i> Ver Notificações
          </button>
        </div>
      </div>

      <h2 className="titulo">Agendamentos Clínica Dentária</h2>

      {/* Dica de uso */}
      <div className="info-banner">
        <i className="bi bi-info-circle-fill"></i>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            {/* Header do modal */}
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <i className="bi bi-calendar-plus"></i> Marcar Consulta
                </h3>
                <p className="modal-subtitle">
                  📅 {new Date(modalData.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close" aria-label="Fechar">
                ×
              </button>
            </div>

            {/* Horário */}
            <div className="modal-row">
              <div className="modal-field--tight">
                <label className="modal-label">⏰ Hora Início</label>
                <input type="time" value={modalData.startTime}
                  onChange={e => setModalData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="modal-input" />
              </div>
              <div className="modal-field--tight">
                <label className="modal-label">⏱ Hora Fim</label>
                <input type="time" value={modalData.endTime}
                  onChange={e => setModalData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="modal-input" />
              </div>
            </div>

            {/* Médico */}
            <div className="modal-field">
              <label className="modal-label">🩺 Médico</label>
              <select value={modalData.doctor}
                onChange={e => setModalData(prev => ({ ...prev, doctor: e.target.value }))}
                className="modal-input">
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Consulta */}
            <div className="modal-field">
              <label className="modal-label">📋 Tipo de Consulta</label>
              <select value={modalData.consultationType}
                onChange={e => setModalData(prev => ({ ...prev, consultationType: e.target.value }))}
                className="modal-input">
                {consultationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Telefone do Paciente */}
            <div className="modal-field modal-field--phone">
              <label className="modal-label">📞 Telemóvel do Paciente</label>
              <input
                type="text"
                placeholder="ex: 912345678"
                value={modalData.phoneNumber}
                onChange={e => setModalData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="modal-input"
                list="modal-pacientes-telefones"
              />
              <datalist id="modal-pacientes-telefones">
                {pacientes.map((p, i) => (
                  <option key={i} value={p.contactoprincipal || ''}>{p.nome}</option>
                ))}
              </datalist>
              {pacientes.length > 0 && (
                <div className="patients-hint">
                  Pacientes: {pacientes.map(p => `${p.nome} (${p.contactoprincipal || 'sem tel.'})`).join(' • ')}
                </div>
              )}
            </div>

            {/* Erro */}
            {modalError && (
              <div className="error-banner">
                <span>❌</span>
                <span>{modalError}</span>
              </div>
            )}

            {/* Botões */}
            <div className="modal-actions">
              <button onClick={handleConfirmarModal} className="btn-confirm">
                <i className="bi bi-check-circle-fill"></i> Confirmar
              </button>
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaInicial;