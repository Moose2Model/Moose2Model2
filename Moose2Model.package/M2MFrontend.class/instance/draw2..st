as yet unclassified
draw2: aString
	| shape |
	shape := TRBoxShape new size: 40.
	shape
		when: TRMouseDragging
		do: [ :e | 
			shape translateBy: e step.
			e signalUpdate ].
	aString = 'Green'
		ifTrue: [ shape color: Color green.
			shape position: 10 @ 10 ].
	aString = 'Red'
		ifTrue: [ shape color: Color red ].
	aString = 'ChooseColor'
		ifTrue: [ | dialog |
			dialog := self factory colorChooser
				title: 'Choose color'.
				dialog selectedColor: Color black.
			"dialog := ColorSelectorDialogWindow new"
			dialog openModal.
			shape color: dialog selectedColor.
			shape position: 5 @ 5 ].
	pane widget trachelCanvas addShape: shape.
	pane widget changed