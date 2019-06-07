world menu
menuCommandOn: aBuilder
	<worldMenu>
	"Make entry in the World Menu"
	aBuilder item: 'Moose2Model'.
	(aBuilder
		item: 'Moose2Model';
		parent: 'Moose2Model') action: [ M2MFrontend new openWithSpec ].
	(aBuilder
		item: 'Documentation';
		parent: 'Moose2Model') action: [ HelpBrowser openOn: M2MHelp ]