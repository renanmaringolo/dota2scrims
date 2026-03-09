require 'rails_helper'

RSpec.describe BaseService do
  before do
    stub_const('TestService', Class.new(described_class))
  end

  describe '.logger' do
    it 'returns Rails.logger' do
      expect(described_class.send(:logger)).to eq(Rails.logger)
    end
  end

  describe '.handle_external_error' do
    let(:error) { StandardError.new('connection refused') }

    before { allow(Rails.logger).to receive(:error) }

    it 'logs the error message with class name' do
      expect do
        described_class.send(:handle_external_error, error)
      end.to raise_error(StandardError, 'connection refused')

      expect(Rails.logger).to have_received(:error).with('[BaseService] External error: connection refused')
    end

    it 'includes context in the log message when provided' do
      expect do
        described_class.send(:handle_external_error, error, context: 'sending email')
      end.to raise_error(StandardError, 'connection refused')

      expected_msg = '[BaseService] External error (sending email): connection refused'
      expect(Rails.logger).to have_received(:error).with(expected_msg)
    end

    it 're-raises the original error' do
      expect do
        described_class.send(:handle_external_error, error)
      end.to raise_error(StandardError, 'connection refused')
    end
  end

  describe 'subclass inheritance' do
    it 'inherits logger from BaseService' do
      expect(TestService.send(:logger)).to eq(Rails.logger)
    end

    it 'inherits handle_external_error from BaseService' do
      error = StandardError.new('timeout')
      allow(Rails.logger).to receive(:error)

      expect do
        TestService.send(:handle_external_error, error)
      end.to raise_error(StandardError, 'timeout')

      expect(Rails.logger).to have_received(:error).with('[TestService] External error: timeout')
    end
  end
end
