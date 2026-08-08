// src/view/PaginaInicial.jsx - Modal ao clicar na agenda com persistência na BD
import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
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

const BASE_URL = 'http://localhost:3000';

const PaginaInicial = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para dados
  const [doctors, setDoctors] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [tiposMarcacao, setTiposMarcacao] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const calendarRef = useRef(null);

  const consultationTypes = [
    'Check-up Geral',
    'Limpeza Dentária / Destartarização',
    'Tratamento de Canal (Endodontia)',
    'Extração Dentária',
    'Ortodontia (Aparelho)',
    'Branqueamento Dentário',
    'Implante Dentário'
  ];

  // Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    doctor: '',
    consultationType: '',
    phoneNumber: '',
    slotStart: null,
    slotEnd: null,
  });
  const [modalError, setModalError] = useState('');

  // 1. Carregar Médicos da API
  const carregarMedicos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/utilizadorperfil/list`);
      const data = await response.json();

      if (data.success && data.data) {
        const medicosList = data.data.map((p, index) => ({
          id: `med${p.idutilizadorprefil}`,
          title: p.nome,
          nomeCompleto: p.nome,
          idPerfil: p.idutilizadorprefil,
          color: ['#b79b53', '#27ae60', '#2980b9', '#9b59b6'][index % 4],
          tipo: 'Médico'
        }));
        setDoctors(medicosList);
      } else {
        setDoctors([
          { id: 'med1', title: 'Dra. Maria Santos', nomeCompleto: 'Dra. Maria Santos', color: '#b79b53', tipo: 'Médico' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setDoctors([
        { id: 'med1', title: 'Dra. Maria Santos', nomeCompleto: 'Dra. Maria Santos', color: '#b79b53', tipo: 'Médico' }
      ]);
    }
  };

  // 2. Carregar Pacientes da API
  const carregarPacientes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/utilizadorperfil/list`);
      const data = await response.json();

      if (data.success && data.data) {
        setPacientes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  // 3. Carregar Tipos de Marcação da API
  const carregarTiposMarcacao = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/consultas/tipomarcacao/list`);
      const data = await response.json();
      if (data.success) {
        setTiposMarcacao(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de marcação:', error);
    }
  };

  // 4. Carregar Consultas da BD e Converter para Eventos do FullCalendar
  const carregarConsultasBD = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/consultas/list`);
      const data = await response.json();

      if (data.success && data.data) {
        const eventosFormatados = data.data
          .filter(c => c.data)
          .map(c => {
            // Extrair data sem conversão UTC: usar os valores da string diretamente
            const dataStr = (typeof c.data === 'string' ? c.data : new Date(c.data).toISOString()).split('T')[0];
            const horaInicio = c.hora ? (c.hora.length === 5 ? `${c.hora}:00` : c.hora) : '09:00:00';

            // Construir usando data local para evitar bug de fuso horário
            const [ano, mes, dia] = dataStr.split('-').map(Number);
            const [hh, mm, ss] = horaInicio.split(':').map(Number);
            const startDate = new Date(ano, mes - 1, dia, hh, mm, ss || 0);

            // Hora fim: usar horaFim se existir, senão +30 min
            let endDate;
            if (c.horaFim) {
              const [fhh, fmm, fss] = c.horaFim.split(':').map(Number);
              endDate = new Date(ano, mes - 1, dia, fhh, fmm, fss || 0);
            } else {
              endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
            }

            const pacienteNome = c.UtilizadorData?.nome || 'Paciente';
            const tipoNome = c.TipoMarcacaoData?.designacao || c.detalhes || 'Consulta';

            return {
              id: `db_${c.idconsulta}`,
              title: `${pacienteNome} — ${tipoNome}`,
              start: startDate,
              end: endDate,
              color: '#b79b53',
              extendedProps: {
                dbId: c.idconsulta,
                pacienteId: c.idutilizadorprefil,
                pacienteNome: pacienteNome,
                telefone: c.numerotelemovel || c.UtilizadorData?.contactoprincipal,
                tipoConsulta: tipoNome,
                medico: c.medico || 'Médico Dentista'
              }
            };
          });

        setEventsList(eventosFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar consultas da BD:', error);
    }
  }, []);

  // Efeito de inicialização
  useEffect(() => {
    carregarMedicos();
    carregarPacientes();
    carregarTiposMarcacao();
    carregarConsultasBD();
  }, [carregarConsultasBD]);

  const buscarPacientePorTelefone = (telefone) => {
    if (!telefone || telefone.trim() === '') return null;
    const telProcurado = telefone.toString().replace(/\D/g, '');

    for (const paciente of pacientes) {
      const telNormalizado = (paciente.contactoprincipal?.toString() || '').replace(/\D/g, '');
      if (telNormalizado === telProcurado || telNormalizado.includes(telProcurado) || telProcurado.includes(telNormalizado)) {
        return {
          id: paciente.idutilizadorprefil,
          nome: paciente.nome,
          telefone: paciente.contactoprincipal,
          email: paciente.gmail
        };
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

    // Usar hora LOCAL (getFullYear/getMonth/getDate) para evitar bug de fuso horário com toISOString()
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

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

  // Confirmar consulta pelo modal (GRAVAR NA BASE DE DADOS)
  const handleConfirmarModal = async () => {
    setModalError('');

    if (!modalData.consultationType || !modalData.phoneNumber) {
      setModalError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const paciente = buscarPacientePorTelefone(modalData.phoneNumber);
    if (!paciente) {
      const lista = pacientes.map(p => `• ${p.nome}: ${p.contactoprincipal || 'Sem telefone'}`).join('\n');
      setModalError(`Paciente não encontrado.\nPacientes disponíveis:\n${lista}`);
      return;
    }

    const doctor = doctors.find(d => d.id === modalData.doctor) || { title: `Dr. ${user?.nome || 'Médico Dentista'}` };

    // Procurar ID do tipo de marcação
    const tipoEncontrado = tiposMarcacao.find(t => t.desling === modalData.consultationType);
    const tipomarcacaoId = tipoEncontrado ? tipoEncontrado.idtipomarcacao : 1;

    try {
      const payload = {
        medico: doctor.title,
        idutilizadorprefil: paciente.id,
        tipomarcacao: tipomarcacaoId,
        data: modalData.date,
        hora: modalData.startTime,
        horaFim: modalData.endTime,
        numerotelemovel: modalData.phoneNumber,
        detalhes: modalData.consultationType
      };

      console.log('A gravar consulta na BD:', payload);

      const response = await fetch(`${BASE_URL}/api/consultas/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await response.json();

      if (dados.success) {
        setShowModal(false);
        await carregarConsultasBD();
      } else {
        setModalError(dados.message || 'Erro ao agendar consulta na base de dados.');
      }
    } catch (error) {
      console.error('Erro ao guardar consulta:', error);
      setModalError('Erro de ligação ao servidor.');
    }
  };

  // Arrastar evento para nova data/hora (ATUALIZAR NA BASE DE DADOS)
  const handleEventDrop = async (info) => {
    const { dbId } = info.event.extendedProps;
    if (!dbId) return; // Evento sem ID na BD, ignorar

    const novaData = info.event.start.toISOString().split('T')[0];
    const novaHora = `${String(info.event.start.getHours()).padStart(2, '0')}:${String(info.event.start.getMinutes()).padStart(2, '0')}:00`;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/update/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date(`${novaData}T12:00:00Z`),
          hora: novaHora
        })
      });
      const dados = await response.json();
      if (!dados.success) {
        alert('Erro ao atualizar a consulta na base de dados. A reverter.');
        info.revert(); // Desfaz o drag se falhar
      } else {
        console.log('Consulta atualizada na BD:', novaData, novaHora);
      }
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      info.revert();
    }
  };

  // Redimensionar evento (ATUALIZAR HORA FIM NA BASE DE DADOS)
  const handleEventResize = async (info) => {
    const { dbId } = info.event.extendedProps;
    if (!dbId) return;

    const novaData = info.event.start.toISOString().split('T')[0];
    const novaHora = `${String(info.event.start.getHours()).padStart(2, '0')}:${String(info.event.start.getMinutes()).padStart(2, '0')}:00`;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/update/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date(`${novaData}T12:00:00Z`),
          hora: novaHora
        })
      });
      const dados = await response.json();
      if (!dados.success) {
        info.revert();
      }
    } catch (error) {
      console.error('Erro ao redimensionar consulta:', error);
      info.revert();
    }
  };

  // Clique num evento existente (REMOVER DA BASE DE DADOS)
  const handleEventClick = async (info) => {
    const { dbId, pacienteNome, tipoConsulta, medico, telefone } = info.event.extendedProps;
    const start = info.event.start ? info.event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';
    const end = info.event.end ? info.event.end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';

    const confirmed = window.confirm(
      `Detalhes da Consulta:\n\nPaciente: ${pacienteNome || info.event.title}\nTelefone: ${telefone || 'N/A'}\nMédico: ${medico || 'N/A'}\nTipo: ${tipoConsulta || 'N/A'}\nHorário: ${start} — ${end}\n\nPretende cancelar e remover esta consulta da base de dados?`
    );

    if (confirmed) {
      try {
        if (dbId) {
          const response = await fetch(`${BASE_URL}/api/consultas/delete/${dbId}`, {
            method: 'DELETE'
          });
          const dados = await response.json();
          if (!dados.success) {
            alert(`Erro ao eliminar consulta: ${dados.message}`);
            return;
          }
        }
        info.event.remove();
        await carregarConsultasBD();
      } catch (error) {
        console.error('Erro ao eliminar consulta:', error);
        alert('Erro ao ligar ao servidor para eliminar a consulta.');
      }
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
              <i className="bi bi-person-badge me-2"></i>Bem-vindo, Dr(a). {user?.nome}!
            </h3>
            <div className="welcome-card__meta">
              <div><i className="bi bi-card-text me-1"></i><strong>ID Conta:</strong> {user?.id}</div>
              <div><i className="bi bi-envelope me-1"></i><strong>Email:</strong> {user?.email}</div>
              <div><i className="bi bi-shield-check me-1"></i><strong>Tipo:</strong> Médico</div>
              <div><i className="bi bi-briefcase me-1"></i><strong>Especialidade:</strong> {user?.especialidade || 'Dentista'}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/backoffice/notificacoes/')}
            className="btn-notifications"
          >
            <i className="bi bi-bell-fill me-1"></i> Ver Notificações
          </button>
        </div>
      </div>

      <h2 className="titulo">Agendamentos Clínica Dentária</h2>

      {/* Dica de uso */}
      <div className="info-banner">
        <i className="bi bi-info-circle-fill me-2"></i>
        <span><strong>Como marcar uma consulta:</strong> Clique e arraste sobre um horário na agenda para o selecionar — a consulta será guardada diretamente na base de dados.</span>
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
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          events={eventsList}
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
                  <i className="bi bi-calendar-plus me-2"></i>Marcar Consulta
                </h3>
                <p className="modal-subtitle">
                  <i className="bi bi-calendar-event me-1"></i>{new Date(modalData.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close" aria-label="Fechar">
                &times;
              </button>
            </div>

            {/* Horário */}
            <div className="modal-row">
              <div className="modal-field--tight">
                <label className="modal-label"><i className="bi bi-clock me-1"></i>Hora Início</label>
                <input type="time" value={modalData.startTime}
                  onChange={e => setModalData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="modal-input" />
              </div>
              <div className="modal-field--tight">
                <label className="modal-label"><i className="bi bi-clock-history me-1"></i>Hora Fim</label>
                <input type="time" value={modalData.endTime}
                  onChange={e => setModalData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="modal-input" />
              </div>
            </div>

            {/* Médico */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-person-workspace me-1"></i>Médico</label>
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
              <label className="modal-label"><i className="bi bi-clipboard2-pulse me-1"></i>Tipo de Consulta</label>
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
              <label className="modal-label"><i className="bi bi-telephone me-1"></i>Telemóvel do Paciente</label>
              <input
                type="text"
                placeholder="ex: 961234567"
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
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{modalError}</span>
              </div>
            )}

            {/* Botões */}
            <div className="modal-actions">
              <button onClick={handleConfirmarModal} className="btn-confirm">
                <i className="bi bi-check-circle-fill me-1"></i> Confirmar & Guardar
              </button>
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                <i className="bi bi-x-circle me-1"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaInicial;