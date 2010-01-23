When %r{^I execute \`(\S+) ([^\`]+)\`$} do |command, args|
  piped_execute("#{executable(command)} #{args}")
end
