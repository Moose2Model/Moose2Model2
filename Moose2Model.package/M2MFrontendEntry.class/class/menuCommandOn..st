world menu
menuCommandOn: aBuilder
	<worldMenu>
	aBuilder item: 'Moose2Model'.
	
	((aBuilder
		item: 'Documentation';
		parent: 'Moose2Model'))
	action: [ HelpBrowser openOn: M2MHelp ]