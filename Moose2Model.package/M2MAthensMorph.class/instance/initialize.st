initialization
initialize
	super initialize.
	"This makes the Morph changing his size when the Spec UI is resized"
	self
		hResizing: #spaceFill;
		vResizing: #spaceFill.
	surface := AthensCairoSurface extent: self extent asIntegerPoint