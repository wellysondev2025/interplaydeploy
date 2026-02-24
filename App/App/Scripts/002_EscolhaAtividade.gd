extends Node2D


# Called when the node enters the scene tree for the first time.
func _ready():
		#Ajuste do Nó para se ajustar a tela de lado, pois rotacionar no meio do programa, deu muito trabalho...	
	var node = get_node(".")
	node.position.y = 720
	node.rotation_degrees = 270
	var l = (get_node("lblVersion") as Label)
	if l !=null:
		l.text = InterplayController.Version + " " + InterplayController.PatientID	
	#deveria só aparecer em debug...
	(get_node("GotoActivity") as TextureButton).visible = InterplayController.InicialActivity > 1

	
# Called every frame. 'delta' is the elapsed time since the previous frame.
@warning_ignore("unused_parameter")
func _process(delta):
	pass

func _on_texture_button_pressed():
	get_tree().change_scene_to_file("res://Scenes/CaminhoDasLetras/scn_atividade_cadastro.tscn")


func _on_goto_activity_pressed():	
	get_tree().change_scene_to_file("res://Scenes/CaminhoDasLetras/scn_atividade_001.tscn")
