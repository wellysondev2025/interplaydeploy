extends Node2D

func _ready():
	if OS.has_feature("debug") and OS.get_name() == "Windows":
		get_viewport().get_window().position = Vector2(10, 50)
		
		var screen_count = DisplayServer.get_screen_count()
		if screen_count > 2:
			get_viewport().get_window().current_screen = 2
		else:
			get_viewport().get_window().current_screen = 0 # primeira tela
		
	# Ajuste do Nó para rotacionar a cena
	var node = get_node(".")
	node.position.y = 720
	node.rotation_degrees = 270

	# Carregar dados do paciente
	InterplayController.load_patient_data()


func _on_tmr_splash_timeout():
	get_tree().change_scene_to_file("res://Scenes/002_EscolhaAtividade.tscn")
