extends TextureRect

var objects: int
var maxObjects =6

# Called when the node enters the scene tree for the first time.
func _ready():
	(self as TextureRect).modulate = 0
	objects = 0
	pass
	
func _can_drop_data(position, data):
	return objects < maxObjects

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _drop_data(position, data):		
	var originNode = data["origin_node"]
	var newElement = TextureButton.new()	
	newElement.texture_normal = (originNode as TextureButton).texture_normal
	newElement.position.x = (self as TextureRect).position.x + (objects*80)
	newElement.position.y = (self as TextureRect).position.y + 20
	(originNode as TextureButton).get_parent().add_child(newElement)
	objects +=1
