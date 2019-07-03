I mock the class ColorSelectorDialogWindow during tests.
Call mockSelectedColor: to predetermine what color will be returned by a user input.
I overwrite openModal to prevent that a window of me is shown during tests.