require 'rails_helper'

RSpec.describe ScrimMailer do
  let(:admin) { create(:user, :admin, email: 'admin@avalanche.gg') }
  let(:manager) { create(:user, :manager) }
  let(:team) do
    create(:team,
           manager: manager,
           manager_email: 'manager@rocksports.gg',
           timezone: 'America/Sao_Paulo')
  end
  let(:time_slot) { create(:time_slot, starts_at: Time.zone.parse('2026-04-10 19:00:00 UTC')) }
  let(:scrim) do
    create(:scrim, :with_lobby_info,
           challenger_team: team,
           time_slot: time_slot)
  end

  before { admin }

  describe '#scheduled_confirmation' do
    subject(:mail) { described_class.scheduled_confirmation(scrim) }

    it 'sends to the challenger team manager email' do
      expect(mail.to).to eq(['manager@rocksports.gg'])
    end

    it 'has the correct subject with formatted time' do
      expect(mail.subject).to match(%r{Scrim confirmada - \d{2}/\d{2} \d{2}:\d{2}})
    end

    it 'includes scrim data in the body' do
      expect(mail.body.encoded).to include(scrim.lobby_name)
    end
  end

  describe '#admin_notification' do
    subject(:mail) { described_class.admin_notification(scrim) }

    it 'sends to the admin email' do
      expect(mail.to).to eq(['admin@avalanche.gg'])
    end

    it 'has the correct subject' do
      expect(mail.subject).to match(%r{Nova scrim agendada - \d{2}/\d{2} \d{2}:\d{2}})
    end

    it 'includes challenger team name in the body' do
      expect(mail.body.encoded).to include(team.name)
    end
  end

  describe '#cancellation_notice' do
    subject(:mail) { described_class.cancellation_notice(scrim) }

    let(:scrim) do
      create(:scrim, :cancelled,
             challenger_team: team,
             time_slot: time_slot,
             cancellation_reason: 'Lero Lero cancelou')
    end

    it 'sends to the challenger team manager email' do
      expect(mail.to).to eq(['manager@rocksports.gg'])
    end

    it 'has the correct subject' do
      expect(mail.subject).to match(%r{Scrim cancelada - \d{2}/\d{2} \d{2}:\d{2}})
    end

    it 'includes cancellation reason in the body' do
      expect(mail.body.encoded).to include('Lero Lero cancelou')
    end
  end

  describe '#admin_cancellation_notice' do
    subject(:mail) { described_class.admin_cancellation_notice(scrim) }

    let(:scrim) do
      create(:scrim, :cancelled,
             challenger_team: team,
             time_slot: time_slot,
             cancellation_reason: 'Lero Lero cancelou')
    end

    it 'sends to the admin email' do
      expect(mail.to).to eq(['admin@avalanche.gg'])
    end

    it 'has the correct subject' do
      expect(mail.subject).to match(%r{Scrim cancelada pelo manager - \d{2}/\d{2} \d{2}:\d{2}})
    end

    it 'includes cancellation reason and team data' do
      body = mail.body.encoded
      expect(body).to include('Lero Lero cancelou')
      expect(body).to include(team.name)
    end
  end

  describe '#scrim_reminder' do
    subject(:mail) { described_class.scrim_reminder(scrim) }

    it 'sends to both admin and manager' do
      expect(mail.to).to contain_exactly('admin@avalanche.gg', 'manager@rocksports.gg')
    end

    it 'has the correct subject' do
      expect(mail.subject).to match(/Lembrete: Scrim em 1 hora - \d{2}:\d{2}/)
    end
  end

  describe '#format_time_for_team' do
    subject(:mail) { described_class.scheduled_confirmation(scrim) }

    context 'when team has timezone set' do
      it 'formats time in the team timezone' do
        expected_time = time_slot.starts_at.in_time_zone('America/Sao_Paulo').strftime('%d/%m %H:%M')
        expect(mail.subject).to include(expected_time)
      end
    end

    context 'when team has no timezone' do
      let(:team) do
        create(:team,
               manager: manager,
               manager_email: 'manager@rocksports.gg',
               timezone: 'America/Sao_Paulo')
      end

      it 'defaults to America/Sao_Paulo' do
        expected_time = time_slot.starts_at.in_time_zone('America/Sao_Paulo').strftime('%d/%m %H:%M')
        expect(mail.subject).to include(expected_time)
      end
    end
  end
end
