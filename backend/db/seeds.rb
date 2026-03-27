Time.zone = 'America/Sao_Paulo'

admin = User.find_or_create_by!(email: 'admin@avalanche.gg') do |user|
  user.password = 'password123'
  user.role = :admin
  user.jti = SecureRandom.uuid
end
puts "User admin: #{admin.email} (#{admin.role})"

manager = User.find_or_create_by!(email: 'manager@rocknsports.gg') do |user|
  user.password = 'password123'
  user.role = :manager
  user.jti = SecureRandom.uuid
end
puts "User manager: #{manager.email} (#{manager.role})"

team = Team.find_or_create_by!(name: 'Rock n Sports', manager: manager) do |t|
  t.manager_name = 'Renan Proenca'
  t.manager_email = 'renan@rocknsports.gg'
  t.timezone = 'America/Sao_Paulo'
end
puts "Team: #{team.name}"

roster = [
  { role: :hard_carry, nickname: 'Metallica', mmr: 6500 },
  { role: :mid_laner,  nickname: 'Lero Lero', mmr: 6200 },
  { role: :offlaner,   nickname: 'Bla Bla',   mmr: 5800 },
  { role: :support_4,  nickname: 'Teste',      mmr: 5500 },
  { role: :support_5,  nickname: 'Backend',    mmr: 5300 },
  { role: :coach,      nickname: 'Lead',       mmr: 7000 },
]

roster.each do |attrs|
  player = Player.find_or_create_by!(team: team, role: attrs[:role]) do |p|
    p.nickname = attrs[:nickname]
    p.mmr = attrs[:mmr]
  end
  puts "  Player: #{player.nickname} (#{player.role}, #{player.mmr} MMR)"
end

slot_hours = [
  { start_hour: 14, end_hour: 16 },
  { start_hour: 20, end_hour: 22 },
]

today = Time.zone.today
start_date = today.beginning_of_week
end_date = (today + 2.weeks).end_of_week

slots = []
(start_date..end_date).each do |date|
  next if date.saturday? || date.sunday?

  slot_hours.each do |hours|
    starts_at = date.in_time_zone.change(hour: hours[:start_hour])
    ends_at = date.in_time_zone.change(hour: hours[:end_hour])

    slot = TimeSlot.find_or_create_by!(starts_at: starts_at) do |ts|
      ts.ends_at = ends_at
      ts.created_by = admin
      ts.status = :available
    end
    slots << slot
  end
end
puts "TimeSlots: #{slots.size} created/found"

if Scrim.exists?
  puts "Scrim: already exists (#{Scrim.count} total)"
else
  first_available = slots.find { |s| s.available? && s.starts_at > Time.current }

  if first_available
    scrim = Scrim.create!(
      time_slot: first_available,
      challenger_team: team,
      status: :scheduled,
      lobby_name: 'AVL-RS-SCRIM',
      lobby_password: 'scrim123',
      server_host: :br,
    )
    first_available.update!(status: :booked)
    puts "Scrim: #{scrim.lobby_name} at #{first_available.starts_at} (#{scrim.status})"
  else
    puts 'Scrim: no available slot found'
  end
end

puts "\nSeed summary: #{User.count} users, #{Team.count} teams, #{Player.count} players, " \
     "#{TimeSlot.count} time_slots, #{Scrim.count} scrims"
