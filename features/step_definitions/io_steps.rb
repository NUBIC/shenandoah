When %r{^I execute \`(\S+) ([^\`]+)\`$} do |command, args|
  puts "Executing #{executable(command)} #{args}"
  piped_execute("#{executable(command)} #{args}")
end
