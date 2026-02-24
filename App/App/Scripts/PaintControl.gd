extends Control

@onready var _parent = get_parent()
@onready var CanvasArea : Sprite2D = _parent.get_node("CanvasArea")
@onready var lblDebugText : Label = _parent.get_node("lblDebug")
# A constant for whether or not we're needing to undo a shape.
const UNDO_MODE_SHAPE = -2
# A constant for whether or not we can undo.
const UNDO_NONE = -1
# How large is the image (it's actually the size of DrawingAreaBG, because that's our background canvas).
const IMAGE_SIZE = Vector2(930, 720)

# Enums for the various modes and brush shapes that can be applied.
enum BrushModes {
	PENCIL,
	ERASER,
	CIRCLE_SHAPE,
	RECTANGLE_SHAPE,
}

enum BrushShapes {
	RECTANGLE,
	CIRCLE,
}

# The top-left position of the canvas.
var TLPosMin
var TLPosMax

# A list to hold all of the dictionaries that make up each brush.
var brush_data_list = []

# A boolean to hold whether or not the mouse is inside the drawing area, the mouse position last _process call
# and the position of the mouse when the left mouse button was pressed.
var is_mouse_in_drawing_area = false
var last_mouse_pos = Vector2()
var mouse_click_start_pos = null
var is_touching = false
var last_point_drawn = Time.get_ticks_msec()

# A boolean to tell whether we've set undo_elements_list_num, which holds the size of draw_elements_list
# before a new stroke is added (unless the current brush mode is 'rectangle shape' or 'circle shape', in
# which case we do things a litte differently. See the undo_stroke function for more details).
var undo_set = false
var undo_element_list_num = -1

# The current brush settings: The mode, size, color, and shape we have currently selected.
var brush_mode = BrushModes.PENCIL
var brush_size = InterplayController.BrushSize
var half_brush_size = brush_size / 2
var brush_color = Color.WHITE
var brush_shape = BrushShapes.CIRCLE;

var erase_size = brush_size*2
var erase_color = Color.WHITE

# The color of the background. We need this for the eraser (see the how we handle the eraser
# in the _draw function for more details).
var bg_color = Color.WHITE

func _ready():
	# Get the top left position node. We need this to find out whether or not the mouse is inside the canvas.
	TLPosMin = get_node("TLPosMin")
	TLPosMax = get_node("TLPosMax")
	set_process(true)
'''
func _input(event):
	if event is InputEventScreenTouch and event.is_released():
		last_mouse_pos = Vector2()
'''
	
func _physics_process(delta):
	var mouse_pos = get_viewport().get_mouse_position()
	
	# Check if the mouse is currently inside the canvas/drawing-area.	
	#is_mouse_in_drawing_area = %Area2D.get_world_2d().direct_space_state.intersect(mouse_pos, 1, )
	
	is_mouse_in_drawing_area = false
	if mouse_pos.x > TLPosMin.global_position.x:
		if mouse_pos.y > TLPosMin.global_position.y:
			if mouse_pos.x < TLPosMax.global_position.x:
				if mouse_pos.y < TLPosMax.global_position.y:
					is_mouse_in_drawing_area = true
	
	#CanvasArea.get_rect().intersects(mouse_pos);

		
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		# If we do not have a position for when the mouse was first clicked, then this must
		# be the first time is_mouse_button_pressed has been called since the mouse button was
		# released, so we need to store the position.
		if mouse_click_start_pos == null:
			mouse_click_start_pos = mouse_pos

		# If the mouse is inside the canvas and the mouse is 1px away from the position of the mouse last _process call.
		if check_if_mouse_is_inside_canvas():
			#if last_mouse_pos.x > 0 && last_mouse_pos.y > 0: #evitar linhas retas
			if (1==1): #apenas pra não perder o contexto
				if mouse_pos.distance_to(last_mouse_pos) >= 1:
					# If we are in pencil or eraser mode, then we need to draw.
					if brush_mode == BrushModes.PENCIL or brush_mode == BrushModes.ERASER:
						# If undo has not been set, meaning we've started a new stroke, then store the size of the
						# draw_elements_list so we can undo from this point in time.
						'''
						if undo_set == false:
							undo_set = true
							undo_element_list_num = brush_data_list.size()
						'''
						# Add the brush object to draw_elements_array.
						add_brush(mouse_pos, brush_mode)
						
						if mouse_pos.distance_to(last_mouse_pos) >= half_brush_size:
							if (Time.get_ticks_msec() - last_point_drawn < 100): 
								var seek_mouse_pos = Vector2()
								seek_mouse_pos = last_mouse_pos
								while (mouse_pos.distance_to(seek_mouse_pos) >= half_brush_size):
									seek_mouse_pos = seek_mouse_pos + (Vector2(mouse_pos - seek_mouse_pos).normalized() * half_brush_size)
									add_brush(seek_mouse_pos, brush_mode, false)
								queue_redraw()
								
						last_point_drawn = Time.get_ticks_msec()
	else:
		# We've finished our stroke, so we can set a new undo (if a new storke is made).
		undo_set = false

		# If the mouse is inside the canvas.
		if check_if_mouse_is_inside_canvas():
			# If we're using either the circle shape mode, or the rectangle shape mode, then
			# add the brush object to draw_elements_array.
			if brush_mode == BrushModes.CIRCLE_SHAPE or brush_mode == BrushModes.RECTANGLE_SHAPE:
				add_brush(mouse_pos, brush_mode)
				# We handle undo's differently than either pencil or eraser mode, so we need to set undo
				# element_list_num to -2 so we can tell if we need to undo a shape. See undo_stroke for details.
				undo_element_list_num = UNDO_MODE_SHAPE
		# Since we've released the left mouse, we need to get a new mouse_click_start_pos next time
		#is_mouse_button_pressed is true.
		mouse_click_start_pos = null

	# Store mouse_pos as last_mouse_pos now that we're done with _process.
	last_mouse_pos = mouse_pos


func check_if_mouse_is_inside_canvas():
	
	if InterplayController.CanDraw:
		# Make sure we have a mouse click starting position.
		if mouse_click_start_pos != null:
			# Make sure the mouse click starting position is inside the canvas.
			# This is so if we start out click outside the canvas (say chosing a color from the color picker)
			# and then move our mouse back into the canvas, it won't start painting.
			if mouse_click_start_pos.x > TLPosMin.global_position.x:
				if mouse_click_start_pos.y > TLPosMin.global_position.y:				
					if mouse_click_start_pos.x < TLPosMax.global_position.x:
						if mouse_click_start_pos.y < TLPosMax.global_position.y:
							# Make sure the current mouse position is inside the canvas.
							if is_mouse_in_drawing_area:
								return true
	return false


func undo_stroke():
	# Only undo a stroke if we have one.
	if undo_element_list_num == UNDO_NONE:
		return

	# If we are undoing a shape, then we can just remove the latest brush.
	if undo_element_list_num == UNDO_MODE_SHAPE:
		if brush_data_list.size() > 0:
			brush_data_list.remove(brush_data_list.size() - 1)

		# Now that we've undone a shape, we cannot undo again until another stoke is added.
		undo_element_list_num = UNDO_NONE
		# NOTE: if we only had shape brushes, then we could remove the above line and could let the user
		# undo until we have a empty element list.

	# Otherwise we're removing a either a pencil stroke or a eraser stroke.
	else:
		# Figure out how many elements/brushes we've added in the last stroke.
		var elements_to_remove = brush_data_list.size() - undo_element_list_num
		# Remove all of the elements we've added this in the last stroke.
		#warning-ignore:unused_variable
		for elment_num in range(0, elements_to_remove):
			brush_data_list.pop_back()

		# Now that we've undone a stoke, we cannot undo again until another stoke is added.
		undo_element_list_num = UNDO_NONE

	# Redraw the brushes
	#update()
	queue_redraw()	


func add_brush(mouse_pos, type, redraw = true):
	# Make new brush dictionary that will hold all of the data we need for the brush.
	var new_brush = {}

	# Populate the dictionary with values based on the global brush variables.
	# We will override these as needed if the brush is a rectange or circle.
	new_brush.brush_type = type
	new_brush.brush_pos = mouse_pos
	new_brush.brush_shape = brush_shape
	new_brush.brush_size = brush_size
	new_brush.brush_color = brush_color	

	brush_data_list.append(new_brush)
	
	# Add the brush and update/draw all of the brushes.
	#update()
	if (redraw):
		queue_redraw()
		#_draw()

func plot_texture_to_canvas():
	# Wait until the frame has finished before getting the texture.
	await RenderingServer.frame_post_draw
	#lblDebugText.text = str(brush_data_list.size())
	
	#CanvasArea.texture = ImageFormatLoader(get_viewport().get_texture().get_image().get_data())
	# Get the viewport image.
	#var img = get_viewport().get_texture().get_image().get_data()
	# Crop the image so we only have canvas area.
	#var cropped_image = img.get_rect(Rect2(TLPosMin.global_position, IMAGE_SIZE))
	# Flip the image on the Y-axis (it's flipped upside down by default).
	#cropped_image.flip_y()

	# Save the image with the passed in path we got from the save dialog.
	#CanvasArea.texture = CanvasItem.texture;

func _draw():
	# Go through all of the brushes in brush_data_list.	
	for brush in brush_data_list:
		draw_circle(brush.brush_pos, brush.brush_size / 2, brush.brush_color)
	
	plot_texture_to_canvas()
		
	
func save_picture(path):
	# Wait until the frame has finished before getting the texture.
	await RenderingServer.frame_post_draw

	# Get the viewport image.
	var img = get_viewport().get_texture().get_image().get_data()
	# Crop the image so we only have canvas area.
	var cropped_image = img.get_rect(Rect2(TLPosMin.global_position, IMAGE_SIZE))
	# Flip the image on the Y-axis (it's flipped upside down by default).
	cropped_image.flip_y()

	# Save the image with the passed in path we got from the save dialog.
	cropped_image.save_png(path)
