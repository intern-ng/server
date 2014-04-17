fun! s:jsStyle()
	set ts=2
	set st=2
	set sw=2
	set et
endfun!

fun! s:makefileStyle()
	setlocal ts=4
	setlocal st=4
	setlocal sw=4
	setlocal noet
endfun!

fun! s:stripTrailingWhitespace()
    let l = line(".")
    let c = col(".")
    %s/\s\+$//e
    call cursor(l,c)
endfun

au FileType javascript call s:jsStyle()
au FileType make call s:makefileStyle()
au BufWritePre * :call <SID>stripTrailingWhitespace()

