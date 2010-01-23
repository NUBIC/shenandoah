When %r{^I execute \`(\S+) ([^\`]+)\`$} do |command, args|
  puts "executing `#{executable(command)} #{args}`"
  piped_execute("#{executable(command)} #{args}")
end
