initialization
mainMenu
	| aMenu |
	aMenu := self newMenuBar
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: 'File';
						icon: (self iconNamed: #openIcon);
						subMenu: self subMenu ].
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Open file';
						icon: (self iconNamed: #openIcon);
						action: [ self inform: 'Open File' ] ].
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Save File';
						icon: (self iconNamed: #smallSaveIcon);
						action: [ self inform: 'Save File' ] ].
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Print file';
						icon: (self iconNamed: #smallPrintIcon);
						action: [ self inform: 'Print file' ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Undo';
						icon: (self iconNamed: #smallUndoIcon);
						action: [ self inform: 'Undo' ] ].
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Redo';
						icon: (self iconNamed: #smallRedoIcon);
						action: [ self inform: 'Redo' ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Add menu item';
						icon: (self iconNamed: #add);
						action: [ self addItemTo: group ] ] ];
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
						description: 'Refresh pane';
						icon: (self iconNamed: #refresh);
						action: [ self refresh ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Refresh pane';
						icon: (self iconNamed: #glamorousGreenCircle);
						action: [ self draw2: #Green ] ] ];
		addGroup: [ :group | 
			group
				addItem: [ :item | 
					item
						name: nil;
						description: 'Refresh pane';
						icon: (self iconNamed: #glamorousRedCircle);
						action: [ self draw2: #Red ] ] ].
	^ aMenu