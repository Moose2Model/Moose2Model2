drawing
draw
	"view widget surface clear: Color gray."

	pane widget surface
		drawDuring: [ :canvas | 
			"First, we clear the surface"
			"view widget surface clear."
			"we can use "
			pane widget surface clear: Color gray.
			"
	as well. A #clear is equivalent to: (surface clear: Color transparent).   "
			"Let''s draw a simple green rectangle"
			canvas setPaint: Color green.
			canvas setShape: (40 @ 40 corner: 100 @ 100).
			canvas draw ].
	"Required so that the chenged drawing is shown"
	pane widget changed