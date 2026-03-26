class ScrimMailer < ApplicationMailer
  def scheduled_confirmation(scrim)
    prepare_scrim_data(scrim)
    mail(to: @team.manager_email, subject: "Scrim confirmada - #{@formatted_time}")
  end

  def admin_notification(scrim)
    prepare_scrim_data(scrim)
    mail(to: admin_email, subject: "Nova scrim agendada - #{@formatted_time}")
  end

  def cancellation_notice(scrim)
    prepare_scrim_data(scrim)
    @reason = scrim.cancellation_reason
    mail(to: @team.manager_email, subject: "Scrim cancelada - #{@formatted_time}")
  end

  def admin_cancellation_notice(scrim)
    prepare_scrim_data(scrim)
    @reason = scrim.cancellation_reason
    mail(to: admin_email, subject: "Scrim cancelada pelo manager - #{@formatted_time}")
  end

  def scrim_reminder(scrim)
    prepare_scrim_data(scrim)
    hour_time = @time_slot.starts_at.in_time_zone(@team.timezone || 'America/Sao_Paulo').strftime('%H:%M')
    mail(
      to: [admin_email, @team.manager_email],
      subject: "Lembrete: Scrim em 1 hora - #{hour_time}",
    )
  end

  private

  def prepare_scrim_data(scrim)
    @scrim = scrim
    @team = scrim.challenger_team
    @time_slot = scrim.time_slot
    @formatted_time = format_time_for_team(@time_slot.starts_at, @team.timezone)
  end

  def format_time_for_team(time, timezone)
    time.in_time_zone(timezone || 'America/Sao_Paulo').strftime('%d/%m %H:%M')
  end

  def admin_email
    User.find_by(role: :admin)&.email || ENV.fetch('ADMIN_EMAIL', 'admin@avalanche.gg')
  end
end
