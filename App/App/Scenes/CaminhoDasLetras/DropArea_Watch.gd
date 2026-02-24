extends TextureRect

@export var Type = "objType"

# Called when the node enters the scene tree for the first time.
func _ready():
	(self as TextureRect).modulate = 0
	pass # Replace with function body.

func _can_drop_data(position, data):
	return data["Type"] == self.Type

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _drop_data(position, data):		
	var originNode = data["origin_node"]
	var button = (originNode as TextureButton)
	
	if Type == "Watch":
		button.scale.x = 0.25
		button.scale.y = 0.25
		button.rotation = 73.6
		button.position.x = 790
		button.position.y = 430
	else:
		#button.position = get_global_mouse_position()
		button.scale.x = 0.5
		button.scale.y = 0.5
		button.position.x = 448
		button.position.y = 312
	pass
