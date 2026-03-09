require 'rails_helper'

RSpec.describe BaseOperation do
  describe '.call' do
    it 'creates an instance and calls #call' do
      stub_const('TestOperation', Class.new(described_class) do
        def call
          'test_result'
        end
      end)

      expect(TestOperation.call).to eq('test_result')
    end
  end

  describe '#call' do
    it 'raises NotImplementedError when not overridden' do
      expect { described_class.new.call }.to raise_error(NotImplementedError)
    end
  end

  describe '#params' do
    it 'returns the params passed' do
      operation = described_class.new(params: { name: 'Lero Lero' })

      expect(operation.params).to eq({ name: 'Lero Lero' })
    end

    it 'defaults to an empty hash when not passed' do
      operation = described_class.new

      expect(operation.params).to eq({})
    end
  end

  describe '#current_user' do
    it 'returns the current_user passed' do
      user = Struct.new(:id).new(1)
      operation = described_class.new(current_user: user)

      expect(operation.current_user).to eq(user)
    end

    it 'defaults to nil when not passed' do
      operation = described_class.new

      expect(operation.current_user).to be_nil
    end
  end

  describe '#with_transaction' do
    it 'wraps block in ActiveRecord transaction' do
      stub_const('TransactionalOperation', Class.new(described_class) do
        def call
          with_transaction { 'inside_transaction' }
        end
      end)

      allow(ActiveRecord::Base).to receive(:transaction).and_yield

      result = TransactionalOperation.call

      expect(ActiveRecord::Base).to have_received(:transaction)
      expect(result).to eq('inside_transaction')
    end
  end

  describe 'subclass behavior' do
    it 'can override #call and return a result' do
      stub_const('CustomOperation', Class.new(described_class) do
        def call
          "custom: #{params[:value]}"
        end
      end)

      result = CustomOperation.call(params: { value: 'Bla Bla' })

      expect(result).to eq('custom: Bla Bla')
    end
  end
end
