extends TextureRect

var objects: int

# Called when the node enters the scene tree for the first time.
func _ready():
	(self as TextureRect).modulate = 0
	objects = 0
	pass


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func _can_drop_data(position, data):
	return objects < 5
	
func _drop_data(position, data):		
	var originNode = data["origin_node"]
	(originNode as TextureButton).position.x = (self as TextureRect).position.x + (objects*105)
	(originNode as TextureButton).position.y = (self as TextureRect).position.y + 50
	objects +=1
