extends TextureRect


func _ready():
	(self as TextureRect).modulate = 0
	pass
	
func _can_drop_data(position, data):
	return true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _drop_data(position, data):		
	var originNode = data["origin_node"]
	#(originNode as TextureButton).position = get_global_mouse_position()
	(originNode as TextureButton).position.y = data["origin_y"]
	(originNode as TextureButton).position.x = data["origin_x"]
	pass
