as yet unclassified
draw2: aString
	| shape |
	shape := TRBoxShape new size: 40.
	shape when: TRMouseDragging
		do: [ :e | 
			shape translateBy: e step.
			e signalUpdate ].
	aString = 'Green'
		ifTrue: [ shape color: Color green ].
	aString = 'Red'
		ifTrue: [ shape color: Color red ].
	pane widget trachelCanvas addShape: shape.
	pane widget changed