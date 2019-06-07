as yet unclassified
initializeWidgets
	| windowMorph |
	windowMorph := M2MAthensMorph new.
	pane := windowMorph asSpecAdapter.
	pane
		when: MorphOpened
		do: [ Transcript
				cr;
				show: 'Opened';
				cr.
			windowMorph resize ].
	menu := self mainMenu.
	list := self newList.
	list items: {'Green' . 'Red'}.
	self focusOrder add: list