extends TextureButton

var isDragged = false
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _get_drag_data(position):
	var data = {}
	data["origin_node"] = self
	data["origin_x"] = self.position.x
	data["origin_y"] = self.position.y
	data["origin_texture"] = texture_normal
	
	var preview = TextureRect.new()	
	preview.texture = self.texture_normal
	preview.size = Vector2(100, 100)
	preview.pivot_offset = Vector2(0, -100)
	set_drag_preview(preview)
	
	isDragged = true
	return data
