as yet unclassified
draw: aString
	pane widget surface
		drawDuring: [ :canvas | 
			"First, we clear the surface"
			"view widget surface clear."
			"we can use "
			pane widget surface clear: Color gray.
			"
	as well. A #clear is equivalent to: (surface clear: Color transparent).   "
			"Let''s draw a simple green rectangle"
			aString = 'Green'
				ifTrue: [ canvas setPaint: Color green ].
			aString = 'Red'
				ifTrue: [ canvas setPaint: Color red ].
			canvas setShape: (40 @ 40 corner: 100 @ 100).
			canvas draw ].
	"Required so that the chenged drawing is shown"
	pane widget changed