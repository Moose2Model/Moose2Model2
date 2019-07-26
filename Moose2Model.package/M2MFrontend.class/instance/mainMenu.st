initialization
mainMenu
	| aMenu |
	aMenu := self newMenuBar
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Open Help';
						icon: (self iconNamed: #help);
						action: [ HelpBrowser openOn: M2MHelp ] ] ];

		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Green';
						icon: (self iconNamed: #glamorousGreenCircle);
						action: [ self draw2: #Green ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Red';
						icon: (self iconNamed: #glamorousRedCircle);
						action: [ self draw2: #Red ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'White';
						icon: (self iconNamed: #glamorousAdd);
						action: [ self draw2: #ChooseColor ] ] ].
	^ aMenu