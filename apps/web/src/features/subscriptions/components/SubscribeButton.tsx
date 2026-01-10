import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

function SubscribeButton() {
  return (
    <>
      <Button variant={'default'}>
        <BellRing className="fill-accent" /> Subscribe
      </Button>
    </>
  );
}

export default SubscribeButton;
