tests
testSingleBox
	"See class MenuPresenterTest how menus are accessed in test"

	| m2m greenButton |
	m2m := M2MFrontend new.
	m2m openWithSpec.	"buildWithSpec."
	greenButton := (m2m mainMenu menuGroups
		select: [ :group | group menuItems first description = #Green ])
		first menuItems first.
	greenButton performMenuActionWith: {}.
	m2m window close "Not needed when test runs in background"