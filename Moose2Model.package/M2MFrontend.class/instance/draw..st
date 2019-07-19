as yet unclassified
draw: aString
	| font |
	self halt.
	font := LogicalFont familyName: 'Arial' pointSize: 20.
	pane widget surface
		drawDuring: [ :canvas | 
			"First, we clear the surface"
			"view widget surface clear."
			"we can use "
			pane widget surface clear: Color white.
			"
	as well. A #clear is equivalent to: (surface clear: Color transparent).   "
			"Let''s draw a simple green rectangle"
			aString = 'Green'
				ifTrue: [ canvas setPaint: Color green ].
			aString = 'Red'
				ifTrue: [ canvas setPaint: Color red ].
			canvas setShape: (40 @ 40 corner: 100 @ 100).
			canvas draw.
			canvas setFont: font.
			canvas setPaint: Color black.
			canvas pathTransform translateX: 0 Y: font getPreciseAscent.
			canvas drawString: aString ].
	"Required so that the chenged drawing is shown"
	pane widget changed