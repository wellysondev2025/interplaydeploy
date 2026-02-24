extends AudioStreamPlayer2D
@export var AudioList : Array[AudioStream]

# Called when the node enters the scene tree for the first time.
func _ready():
	if (AudioList[InterplayController.InicialActivity] != null):
		var asp2d = (get_parent().get_node("AudioStreamPlayer2D") as AudioStreamPlayer2D)
		asp2d.stream = AudioList[InterplayController.InicialActivity]
		asp2d.play()
		
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
