default:
	git tag $$(git rev-parse --short HEAD)
	git push
	git push --tags -v
