extends Control

# =========================
# VARIÁVEIS
# =========================
var ProfessionalCode: String = ''
var state = 'ProfessionalCode'
var PatientName: String = ''

# HTTPRequests
var http_validate: HTTPRequest
var http_buscar_hash: HTTPRequest
var http_create_patient: HTTPRequest
var http_session_create: HTTPRequest

# =========================
# READY
# =========================
func _ready():
	_updateState('ProfessionalCode')
	
	# Referências aos HTTPRequests
	http_validate = get_node_or_null("HTTPRequest_ValidateProfessional")
	http_buscar_hash = get_node_or_null("HTTPReq_BuscarHash")
	http_create_patient = get_node_or_null("HTTPReq_CreatePatient")
	http_session_create = get_node_or_null("HTTPRequest_SessionCreate")
	
	if not http_validate or not http_buscar_hash or not http_create_patient or not http_session_create:
		print("Erro: algum HTTPRequest não encontrado!")

# =========================
# ESTADOS DE TELA
# =========================
func _updateState(_state: String):
	state = _state
	
	if _state == 'ProfessionalCode':
		if $Content/lblTitulo:
			$Content/lblTitulo.text = 'Informe o código do profissional:'
		if $Content/tbxProximo:
			$Content/tbxProximo.visible = true
		if $Content/tbxInicio:
			$Content/tbxInicio.visible = false
	else:
		if $Content/lblTitulo:
			$Content/lblTitulo.text = 'Escreva seu nome completo na linha abaixo:'
		if $Content/tbxProximo:
			$Content/tbxProximo.visible = false
		if $Content/tbxInicio:
			$Content/tbxInicio.visible = true

	# Limpa tbxNome sempre que muda de tela
	if $Content/tbxNome:
		$Content/tbxNome.text = ''

# =========================
# VALIDAÇÃO PROFISSIONAL
# =========================
func validar_profissional(code: String):
	if http_validate == null:
		print("Erro: http_validate não definido")
		return
	
	var url = "http://127.0.0.1:8000/api/game/professional/validate/"
	var payload = {"code": code}
	var req_headers = ["Content-Type: application/json"]
	var body = JSON.stringify(payload)
	http_validate.request(url, req_headers, HTTPClient.METHOD_POST, body)

func _on_http_request_validate_professional_request_completed(result, response_code, _headers, body):
	if result != HTTPRequest.RESULT_SUCCESS or response_code < 200 or response_code >= 300:
		show_error()
		return
	
	var json = JSON.parse_string(body.get_string_from_utf8())
	if json == null or not json.has("success") or not json["success"]:
		show_error()
		return

	# Muda de tela para digitar nome
	_updateState('PatientName')

	# Buscar paciente se já tiver hash
	if InterplayController.PatientID != "":
		if http_buscar_hash == null:
			print("Erro: http_buscar_hash não definido")
			return
		
		var url = "http://127.0.0.1:8000/api/game/patient/get/"
		var payload = {"hash": InterplayController.PatientID}
		var json_string = JSON.stringify(payload)
		var req_headers = ["Content-Type: application/json"]
		http_buscar_hash.request(url, req_headers, HTTPClient.METHOD_POST, json_string)

# =========================
# CRIAÇÃO DE PACIENTE
# =========================
func _on_tbx_inicio_pressed():
	var tbxNome = $Content/tbxNome
	if tbxNome == null:
		print("Erro: tbxNome não encontrado")
		return
	
	if tbxNome.text.strip_edges() == "":
		tbxNome.text = "noname"
		return
	
	if InterplayController.PatientName != tbxNome.text or InterplayController.PatientID == "":
		var data_nasc = "2001-01-01"
		if http_create_patient == null:
			print("Erro: http_create_patient não definido")
			return
		
		var url = "http://127.0.0.1:8000/api/game/patient/create/"
		var payload = {
			"date_nasc": data_nasc,
			"name": tbxNome.text.strip_edges(),
			"device": "Android",
			"code": str(ProfessionalCode)
		}
		var json_string = JSON.stringify(payload)
		var req_headers = ["Content-Type: application/json"]
		http_create_patient.request(url, req_headers, HTTPClient.METHOD_POST, json_string)
	else:
		start_session()

func _on_http_req_create_patient_request_completed(result, response_code, _headers, body):
	if response_code < 200 or response_code >= 300:
		show_error()
		return
	
	var json = JSON.parse_string(body.get_string_from_utf8())
	if json != null and json.has("success") and json["success"]:
		# create patient: Django retorna os dados dentro de "data"
		InterplayController.PatientID = json["data"]["hash_patient"]
		InterplayController.PatientName = json["data"]["name"]
		InterplayController.save_patient_data()
		start_session()
	else:
		show_error()

# =========================
# SESSÃO
# =========================
func start_session():
	if InterplayController.PatientID == "":
		show_error()
		return
	
	if http_session_create == null:
		print("Erro: http_session_create não definido")
		return
	
	var url = "http://127.0.0.1:8000/api/game/session/create/"
	var payload = {
		"session_type": "CDL 001",
		"version_app": InterplayController.Version,
		"hash_patient": InterplayController.PatientID
	}
	var json_string = JSON.stringify(payload)
	var req_headers = ["Content-Type: application/json"]
	http_session_create.request(url, req_headers, HTTPClient.METHOD_POST, json_string)

func _on_http_request_session_create_request_completed(result, response_code, _headers, body):
	if response_code < 200 or response_code >= 300:
		show_error()
		return
	
	var json = JSON.parse_string(body.get_string_from_utf8())
	if json != null and json.has("success") and json["success"]:
		# acessar a chave correta: "session"
		InterplayController.ActualSessionHash = json["session"]["session_hash"]
		get_tree().change_scene_to_file("res://Scenes/CaminhoDasLetras/scn_atividade_001.tscn")
	else:
		show_error()

# =========================
# BUSCAR PACIENTE POR HASH
# =========================
func _on_http_req_buscar_hash_request_completed(result, response_code, _headers, body):
	if response_code != 200:
		return
	
	var tbxNome = $Content/tbxNome
	if tbxNome == null:
		print("Erro: tbxNome não encontrado")
		return
	
	var json = JSON.parse_string(body.get_string_from_utf8())
	if json != null and json.has("success") and json["success"]:
		# get patient by hash: Django retorna direto em "patient", sem "data"
		tbxNome.text = json["patient"]["name"]
		InterplayController.PatientName = json["patient"]["name"]
		InterplayController.SessionInitialTime = Time.get_unix_time_from_system()

# =========================
# BOTÕES
# =========================
func _on_tbx_proximo_pressed():
	var tbxNome = $Content/tbxNome
	if tbxNome == null:
		print("Erro: tbxNome não encontrado")
		return
	
	ProfessionalCode = tbxNome.text.strip_edges()
	if ProfessionalCode == "":
		return
	validar_profissional(ProfessionalCode)

func _on_tbx_ok_pressed():
	if $Content.get_node_or_null("AlertBox"):
		$Content/AlertBox.visible = false
	if $Content.get_node_or_null("Content"):
		$Content/Content.visible = true
	_updateState('ProfessionalCode')

func show_error():
	if $Content.get_node_or_null("AlertBox"):
		$Content/AlertBox.visible = true
	if $Content.get_node_or_null("Content"):
		$Content/Content.visible = false