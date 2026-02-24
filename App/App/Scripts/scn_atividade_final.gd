	extends Control


	# Called when the node enters the scene tree for the first time.
	func _ready():

		var session_end_time = Time.get_unix_time_from_system()
		var session_total_time = (session_end_time - InterplayController.SessionInitialTime)

		$AudioPlayer.play()

		var url = InterplayController.ApiRoot + "game/session/finalize/"

		var payload = {
			"session_hash": InterplayController.ActualSessionHash
		}

		var json_string = JSON.stringify(payload)
		var headers = ["Content-Type: application/json"]

		$HTTPRequest_EndSession.request(
			url,
			headers,
			HTTPClient.METHOD_POST,
			json_string
		)
				


	# Called every frame. 'delta' is the elapsed time since the previous frame.
	func _process(delta):
		pass


	func _on_tbx_inicio_pressed():
		get_tree().change_scene_to_file("res://Scenes/002_EscolhaAtividade.tscn")


	func _on_tbx_back_pressed():
		get_tree().change_scene_to_file("res://Scenes/002_EscolhaAtividade.tscn")


	func _on_http_request_end_session_request_completed(result, response_code, headers, body):

		if result != HTTPRequest.RESULT_SUCCESS:
			print("Erro HTTP")
			return

		if response_code < 200 or response_code >= 300:
			print("Erro backend:", response_code)
			return

		var json = JSON.parse_string(body.get_string_from_utf8())

		if json == null:
			print("JSON inválido")
			return
			
		if json.has("success") and json.success:
			print("Sessão finalizada com sucesso")
		else:
			print("Erro ao finalizar:", json)
