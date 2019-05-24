as yet unclassified
initializeWidgets
	menu := self mainMenu.
	list := self newList.
	list
		items:
			{'A'.'B'}.
	self focusOrder add: list