// src/view/PaginaInicial.jsx - Modal ao clicar na agenda com edicao, eliminação, urgência e criação de paciente
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
import urlGlobal from './url_global';

const BASE_URL = urlGlobal.endsWith('/') ? urlGlobal.slice(0, -1) : urlGlobal;

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

  // Estado do modal de nova marcação
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    doctor: '',
    consultationType: '',
    phoneNumber: '',
    urgencia: 'Normal',
    slotStart: null,
    slotEnd: null,
  });
  const [modalError, setModalError] = useState('');

  // Estado do formulário de criação rápida de paciente no modal
  const [showNovoPacienteForm, setShowNovoPacienteForm] = useState(false);
  const [novoPacienteData, setNovoPacienteData] = useState({
    nome: '',
    contactoprincipal: '',
    gmail: '',
    nif: ''
  });
  const [criandoPaciente, setCriandoPaciente] = useState(false);

  // Estado do modal de EDIÇÃO / DETALHES de consulta existente
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({
    dbId: null,
    date: '',
    startTime: '',
    endTime: '',
    doctor: '',
    consultationType: '',
    phoneNumber: '',
    urgencia: 'Normal',
    detalhes: '',
    pacienteNome: '',
    pacienteId: null
  });
  const [editModalError, setEditModalError] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // 1. Carregar Médicos da API
  const carregarMedicos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/utilizadorperfil/list`);
      const data = await response.json();

      if (data.success && data.data) {
        const medicosFiltrados = data.data.filter(p => 
          (p.profissao && (p.profissao.toLowerCase().includes('médic') || p.profissao.toLowerCase().includes('doutor'))) || 
          (p.nome && (p.nome.toLowerCase().includes('dr') || p.nome.toLowerCase().includes('médic')))
        );
        const listToUse = medicosFiltrados.length > 0 ? medicosFiltrados : [
          { nome: 'Dra. Maria Santos', idutilizadorprefil: 1 }
        ];
        const medicosList = listToUse.map((p, index) => ({
          id: p.nome,
          title: p.nome,
          nomeCompleto: p.nome,
          idPerfil: p.idutilizadorprefil,
          color: ['#b79b53', '#27ae60', '#2980b9', '#9b59b6'][index % 4],
          tipo: 'Médico'
        }));
        setDoctors(medicosList);
      } else {
        setDoctors([
          { id: 'Dra. Maria Santos', title: 'Dra. Maria Santos', nomeCompleto: 'Dra. Maria Santos', color: '#b79b53', tipo: 'Médico' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setDoctors([
        { id: 'Dra. Maria Santos', title: 'Dra. Maria Santos', nomeCompleto: 'Dra. Maria Santos', color: '#b79b53', tipo: 'Médico' }
      ]);
    }
  };

  // 2. Carregar Pacientes da API
  const carregarPacientes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/utilizadorperfil/list`);
      const data = await response.json();

      if (data.success && data.data) {
        const apenasPacientes = data.data.filter(p => 
          !(p.profissao && (p.profissao.toLowerCase().includes('médic') || p.profissao.toLowerCase().includes('doutor'))) &&
          !(p.nome && (p.nome.toLowerCase().startsWith('dr.') || p.nome.toLowerCase().startsWith('dra.')))
        );
        setPacientes(apenasPacientes);
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
            const dataStr = (typeof c.data === 'string' ? c.data : new Date(c.data).toISOString()).split('T')[0];
            const horaInicio = c.hora ? (c.hora.length === 5 ? `${c.hora}:00` : c.hora) : '09:00:00';

            const [ano, mes, dia] = dataStr.split('-').map(Number);
            const [hh, mm, ss] = horaInicio.split(':').map(Number);
            const startDate = new Date(ano, mes - 1, dia, hh, mm, ss || 0);

            let endDate;
            if (c.horaFim) {
              const [fhh, fmm, fss] = c.horaFim.split(':').map(Number);
              endDate = new Date(ano, mes - 1, dia, fhh, fmm, fss || 0);
            } else {
              endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
            }

            const pacienteNome = c.UtilizadorData?.nome || 'Paciente';
            const tipoNome = c.TipoMarcacaoData?.desling || c.detalhes || 'Consulta';
            const urgenciaNivel = c.urgencia || 'Normal';

            // Cor baseada na urgência
            let color = '#b79b53';
            if (urgenciaNivel === 'Muito Urgente') color = '#e74c3c';
            else if (urgenciaNivel === 'Urgente') color = '#e67e22';

            return {
              id: `db_${c.idconsulta}`,
              title: `${urgenciaNivel !== 'Normal' ? `[${urgenciaNivel.toUpperCase()}] ` : ''}${pacienteNome} — ${tipoNome}`,
              start: startDate,
              end: endDate,
              color: color,
              extendedProps: {
                dbId: c.idconsulta,
                pacienteId: c.idutilizadorprefil,
                pacienteNome: pacienteNome,
                telefone: c.numerotelemovel || c.UtilizadorData?.contactoprincipal,
                tipoConsulta: tipoNome,
                medico: c.medico || 'Médico Dentista',
                urgencia: urgenciaNivel,
                detalhes: c.detalhes || '',
                guiaTratamento: c.guia_tratamento || ''
              }
            };
          });

        setEventsList(eventosFormatados);
        setTimeout(() => applyDoctorFilter(selectedDoctor), 100);
      }
    } catch (error) {
      console.error('Erro ao carregar consultas da BD:', error);
    }
  }, []);

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

  // Abrir modal de NOVA consulta
  const handleSelect = (info) => {
    const startDate = info.start;
    const endDate = info.end;

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
      urgencia: 'Normal',
      slotStart: startDate,
      slotEnd: endDate,
    });
    setShowNovoPacienteForm(false);
    setNovoPacienteData({ nome: '', contactoprincipal: '', gmail: '', nif: '' });
    setModalError('');
    setShowModal(true);
  };

  // Criar paciente rápido diretamente no modal de agendamento
  const handleCriarPacienteRapido = async () => {
    if (!novoPacienteData.nome || !novoPacienteData.contactoprincipal) {
      setModalError('Preencha pelo menos o Nome e Telemóvel do novo paciente.');
      return;
    }

    try {
      setCriandoPaciente(true);
      setModalError('');

      const formData = new FormData();
      formData.append('nome', novoPacienteData.nome);
      formData.append('contactoprincipal', novoPacienteData.contactoprincipal);
      if (novoPacienteData.gmail) formData.append('gmail', novoPacienteData.gmail);
      if (novoPacienteData.nif) formData.append('nif', novoPacienteData.nif);

      const response = await fetch(`${BASE_URL}/utilizadorperfil/create`, {
        method: 'POST',
        body: formData
      });

      const res = await response.json();

      if (res.success) {
        await carregarPacientes();
        setModalData(prev => ({ ...prev, phoneNumber: novoPacienteData.contactoprincipal }));
        setShowNovoPacienteForm(false);
        setNovoPacienteData({ nome: '', contactoprincipal: '', gmail: '', nif: '' });
      } else {
        setModalError(res.message || 'Erro ao criar novo paciente.');
      }
    } catch (err) {
      console.error('Erro ao criar paciente:', err);
      setModalError('Erro de ligação ao criar paciente.');
    } finally {
      setCriandoPaciente(false);
    }
  };

  // Confirmar NOVO agendamento
  const handleConfirmarModal = async () => {
    setModalError('');

    if (!modalData.consultationType || !modalData.phoneNumber) {
      setModalError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const paciente = buscarPacientePorTelefone(modalData.phoneNumber);
    if (!paciente) {
      setModalError(`Paciente com contacto "${modalData.phoneNumber}" não foi encontrado. Clique em "+ Criar Paciente" para o registar.`);
      return;
    }

    const doctorObj = doctors.find(d => d.id === modalData.doctor || d.title === modalData.doctor);
    const medicoNome = doctorObj ? doctorObj.title : (doctors.length > 0 ? doctors[0].title : 'Dra. Maria Santos');

    const tipoEncontrado = tiposMarcacao.find(t => t.desling === modalData.consultationType);
    const tipomarcacaoId = tipoEncontrado ? tipoEncontrado.idtipomarcacao : 1;

    try {
      const payload = {
        medico: medicoNome,
        idutilizadorprefil: paciente.id,
        tipomarcacao: tipomarcacaoId,
        data: modalData.date,
        hora: modalData.startTime,
        horaFim: modalData.endTime,
        numerotelemovel: modalData.phoneNumber,
        detalhes: modalData.consultationType,
        urgencia: modalData.urgencia
      };

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

  // Clique num evento existente -> Abrir Modal de EDIÇÃO/DETALHES
  const handleEventClick = (info) => {
    const { dbId, pacienteNome, pacienteId, tipoConsulta, medico, telefone, urgencia, detalhes } = info.event.extendedProps;
    
    const startDate = info.event.start;
    const endDate = info.event.end;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = endDate ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}` : '';

    setEditModalData({
      dbId: dbId,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      doctor: medico || (doctors.length > 0 ? doctors[0].id : ''),
      consultationType: tipoConsulta || consultationTypes[0],
      phoneNumber: telefone || '',
      urgencia: urgencia || 'Normal',
      detalhes: detalhes || '',
      pacienteNome: pacienteNome || 'Paciente',
      pacienteId: pacienteId
    });
    setEditModalError('');
    setShowEditModal(true);
  };

  // Guardar EDIÇÃO de consulta existente
  const handleSalvarEdicao = async () => {
    if (!editModalData.dbId) return;

    try {
      setSalvandoEdicao(true);
      setEditModalError('');

      const response = await fetch(`${BASE_URL}/api/consultas/update/${editModalData.dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medico: editModalData.doctor,
          data: editModalData.date,
          hora: editModalData.startTime,
          horaFim: editModalData.endTime,
          numerotelemovel: editModalData.phoneNumber,
          detalhes: editModalData.consultationType,
          urgencia: editModalData.urgencia
        })
      });

      const resData = await response.json();

      if (resData.success) {
        setShowEditModal(false);
        await carregarConsultasBD();
      } else {
        setEditModalError(resData.message || 'Erro ao atualizar a consulta.');
      }
    } catch (err) {
      console.error('Erro ao editar consulta:', err);
      setEditModalError('Erro de ligação ao servidor.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // ELIMINAR consulta no modal de edição
  const handleEliminarConsulta = async () => {
    if (!editModalData.dbId) return;

    const confirmed = window.confirm(`Tem a certeza que pretende cancelar e eliminar a consulta de ${editModalData.pacienteNome}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/delete/${editModalData.dbId}`, {
        method: 'DELETE'
      });
      const dados = await response.json();
      if (dados.success) {
        setShowEditModal(false);
        await carregarConsultasBD();
      } else {
        setEditModalError(dados.message || 'Erro ao eliminar consulta.');
      }
    } catch (error) {
      console.error('Erro ao eliminar consulta:', error);
      setEditModalError('Erro ao ligar ao servidor para eliminar.');
    }
  };

  // Drag and drop do evento
  const handleEventDrop = async (info) => {
    const { dbId } = info.event.extendedProps;
    if (!dbId) return;

    const startDate = info.event.start;
    const endDate = info.event.end;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const novaDataStr = `${year}-${month}-${day}`;

    const novaHora = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:00`;
    const novaHoraFim = endDate ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00` : null;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/update/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: novaDataStr,
          hora: novaHora,
          horaFim: novaHoraFim
        })
      });
      const dados = await response.json();
      if (!dados.success) {
        alert('Erro ao atualizar a consulta na base de dados. A reverter.');
        info.revert();
      } else {
        await carregarConsultasBD();
      }
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      info.revert();
    }
  };

  // Resize do evento
  const handleEventResize = async (info) => {
    const { dbId } = info.event.extendedProps;
    if (!dbId) return;

    const startDate = info.event.start;
    const endDate = info.event.end;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const novaDataStr = `${year}-${month}-${day}`;

    const novaHora = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:00`;
    const novaHoraFim = endDate ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00` : null;

    try {
      const response = await fetch(`${BASE_URL}/api/consultas/update/${dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: novaDataStr,
          hora: novaHora,
          horaFim: novaHoraFim
        })
      });
      const dados = await response.json();
      if (!dados.success) {
        alert('Erro ao atualizar a duração na base de dados. A reverter.');
        info.revert();
      } else {
        await carregarConsultasBD();
      }
    } catch (error) {
      console.error('Erro ao redimensionar consulta:', error);
      info.revert();
    }
  };

  const applyDoctorFilter = (doctorVal) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.getEvents().forEach(event => {
        if (!doctorVal || doctorVal === 'all') {
          event.setProp('display', 'auto');
        } else {
          const eventMedico = (event.extendedProps?.medico || '').toLowerCase();
          const target = doctorVal.toLowerCase();
          const match = eventMedico.includes(target) || target.includes(eventMedico);
          event.setProp('display', match ? 'auto' : 'none');
        }
      });
    }
  };

  const handleDoctorFilterChange = (e) => {
    const selected = e.target.value;
    setSelectedDoctor(selected);
    applyDoctorFilter(selected);
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
        <span><strong>Instruções:</strong> Arraste no calendário para agendar. Clique numa consulta existente para <strong>Editar</strong>, <strong>Eliminar</strong> ou abrir <strong>Apontamentos & Prescrições</strong>.</span>
      </div>

      {/* Filtro e Pesquisa de Médico */}
      <div id="doctor-filter" className="mb-3 d-flex align-items-center gap-2 flex-wrap bg-white p-3 rounded shadow-sm border">
        <label className="me-2 mb-0 fw-bold"><i className="bi bi-funnel-fill text-primary me-1"></i>Filtrar por Médico:</label>
        <select id="doctorSelect" className="form-select d-inline-block w-auto" value={selectedDoctor} onChange={handleDoctorFilterChange}>
          <option value="all">Todos os Médicos</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.title}>{doc.title}</option>
          ))}
        </select>
        <div className="input-group w-auto">
          <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Pesquisar por nome do médico..."
            value={selectedDoctor === 'all' ? '' : selectedDoctor}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDoctor(val || 'all');
              applyDoctorFilter(val || 'all');
            }}
          />
        </div>
        {selectedDoctor !== 'all' && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setSelectedDoctor('all');
              applyDoctorFilter('all');
            }}
          >
            <i className="bi bi-x-circle me-1"></i>Limpar Filtro
          </button>
        )}
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

      {/* ===== MODAL DE NOVA MARCAÇÃO ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
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

            {/* Grau de Urgência */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-exclamation-triangle me-1"></i>Nível de Urgência</label>
              <select value={modalData.urgencia}
                onChange={e => setModalData(prev => ({ ...prev, urgencia: e.target.value }))}
                className="modal-input">
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
                <option value="Muito Urgente">Muito Urgente</option>
              </select>
            </div>

            {/* Telefone do Paciente */}
            <div className="modal-field modal-field--phone">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="modal-label mb-0"><i className="bi bi-telephone me-1"></i>Telemóvel do Paciente</label>
                <button 
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  style={{ color: '#A99C5E', fontWeight: 'bold' }}
                  onClick={() => setShowNovoPacienteForm(!showNovoPacienteForm)}
                >
                  {showNovoPacienteForm ? '✕ Cancelar Novo Paciente' : '+ Criar Novo Paciente'}
                </button>
              </div>

              {/* Form de Novo Paciente Rápido */}
              {showNovoPacienteForm ? (
                <div className="p-3 mb-2 bg-light border rounded">
                  <h6 className="fw-bold mb-2 text-secondary"><i className="bi bi-person-plus me-1"></i>Registo Rápido de Paciente</h6>
                  <div className="row g-2">
                    <div className="col-12">
                      <input 
                        type="text" 
                        placeholder="Nome Completo *" 
                        className="form-control form-control-sm"
                        value={novoPacienteData.nome}
                        onChange={e => setNovoPacienteData(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div className="col-6">
                      <input 
                        type="text" 
                        placeholder="Telemóvel *" 
                        className="form-control form-control-sm"
                        value={novoPacienteData.contactoprincipal}
                        onChange={e => setNovoPacienteData(prev => ({ ...prev, contactoprincipal: e.target.value }))}
                      />
                    </div>
                    <div className="col-6">
                      <input 
                        type="email" 
                        placeholder="Email" 
                        className="form-control form-control-sm"
                        value={novoPacienteData.gmail}
                        onChange={e => setNovoPacienteData(prev => ({ ...prev, gmail: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-primary w-100 mt-1"
                        onClick={handleCriarPacienteRapido}
                        disabled={criandoPaciente}
                      >
                        {criandoPaciente ? 'A criar...' : 'Guardar & Selecionar Paciente'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              {pacientes.length > 0 && !showNovoPacienteForm && (
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

      {/* ===== MODAL DE EDIÇÃO & DETALHES DA CONSULTA ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>Editar Agendamento
                </h3>
                <p className="modal-subtitle">
                  <i className="bi bi-person-fill me-1"></i>Paciente: <strong>{editModalData.pacienteNome}</strong>
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="modal-close" aria-label="Fechar">
                &times;
              </button>
            </div>

            {/* Data */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-calendar-date me-1"></i>Data da Consulta</label>
              <input 
                type="date" 
                value={editModalData.date}
                onChange={e => setEditModalData(prev => ({ ...prev, date: e.target.value }))}
                className="modal-input" 
              />
            </div>

            {/* Horário */}
            <div className="modal-row">
              <div className="modal-field--tight">
                <label className="modal-label"><i className="bi bi-clock me-1"></i>Hora Início</label>
                <input type="time" value={editModalData.startTime}
                  onChange={e => setEditModalData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="modal-input" />
              </div>
              <div className="modal-field--tight">
                <label className="modal-label"><i className="bi bi-clock-history me-1"></i>Hora Fim</label>
                <input type="time" value={editModalData.endTime}
                  onChange={e => setEditModalData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="modal-input" />
              </div>
            </div>

            {/* Médico */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-person-workspace me-1"></i>Médico Responsável</label>
              <select value={editModalData.doctor}
                onChange={e => setEditModalData(prev => ({ ...prev, doctor: e.target.value }))}
                className="modal-input">
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.title}>{doc.title}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Consulta */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-clipboard2-pulse me-1"></i>Tipo de Consulta</label>
              <select value={editModalData.consultationType}
                onChange={e => setEditModalData(prev => ({ ...prev, consultationType: e.target.value }))}
                className="modal-input">
                {consultationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Nível de Urgência */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-exclamation-diamond me-1"></i>Nível de Urgência</label>
              <select value={editModalData.urgencia}
                onChange={e => setEditModalData(prev => ({ ...prev, urgencia: e.target.value }))}
                className="modal-input">
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
                <option value="Muito Urgente">Muito Urgente</option>
              </select>
            </div>

            {/* Telefone */}
            <div className="modal-field">
              <label className="modal-label"><i className="bi bi-telephone me-1"></i>Telemóvel do Paciente</label>
              <input
                type="text"
                value={editModalData.phoneNumber}
                onChange={e => setEditModalData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="modal-input"
              />
            </div>

            {/* Erro */}
            {editModalError && (
              <div className="error-banner">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{editModalError}</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="d-flex flex-column gap-2 mt-3">
              
              <button 
                onClick={() => navigate(`/backoffice/consulta/${editModalData.dbId}`)}
                className="btn text-white fw-bold"
                style={{ backgroundColor: '#27ae60' }}
              >
                <i className="bi bi-journal-check me-1"></i> Abrir Apontamentos & Prescrições
              </button>

              <div className="modal-actions mt-1">
                <button onClick={handleSalvarEdicao} disabled={salvandoEdicao} className="btn-confirm">
                  <i className="bi bi-check-circle-fill me-1"></i> {salvandoEdicao ? 'A guardar...' : 'Salvar Alterações'}
                </button>
                <button onClick={handleEliminarConsulta} className="btn-cancel" style={{ backgroundColor: '#dc3545' }}>
                  <i className="bi bi-trash-fill me-1"></i> Eliminar Consulta
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PaginaInicial;