specs
defaultSpec
	<spec: #default>
	^ SpecBoxLayout newVertical
		add: #menu
			withConstraints: [ :constraints | constraints height: self toolbarHeight ];
		add:
			(SpecPanedLayout newHorizontal
				position: 200;
				add: #list;
				add: #pane;
				yourself);
		yourself