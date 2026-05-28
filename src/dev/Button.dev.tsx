import { Button } from "../components/ui/Button";

export function ButtonDev() {
  const variants = ["primary", "secondary", "tertiary", "hero"] as const;
  const sizes = ["sm", "md", "lg"] as const;

  return (
    <div className="p-8 space-y-12 bg-[#0a1224] min-h-screen">
      {variants.map((v) => (
        <div key={v}>
          <h3 className="text-slate-400 uppercase text-xs tracking-widest mb-3">
            {v}
          </h3>
          <div className="flex gap-4 items-center mb-2">
            {sizes.map((s) => (
              <Button key={s} variant={v} size={s}>
                <Button.Text>
                  {v} · {s}
                </Button.Text>
              </Button>
            ))}
            <Button variant={v} disabled>
              <Button.Text>disabled</Button.Text>
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            {sizes.map((s) => (
              <Button key={s} variant={v} size={s} iconOnly>
                <Button.Icon name="gear-fill" />
              </Button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3 className="text-slate-400 uppercase text-xs tracking-widest mb-3">
          tab
        </h3>
        <div className="flex gap-2">
          <Button variant="tab" selected>
            <Button.Text>Összefoglaló</Button.Text>
          </Button>
          <Button variant="tab">
            <Button.Text>Választási térkép</Button.Text>
          </Button>
          <Button variant="tab">
            <Button.Text>Statisztikák</Button.Text>
          </Button>
          <Button variant="tab" disabled>
            <Button.Text>Előzmények</Button.Text>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-slate-400 uppercase text-xs tracking-widest mb-3">
          subtab
        </h3>
        <div className="flex gap-8">
          <Button variant="subtab" selected>
            <Button.Text>Áttekintés</Button.Text>
          </Button>
          <Button variant="subtab">
            <Button.Text>Körzetek</Button.Text>
          </Button>
          <Button variant="subtab">
            <Button.Text>Pénzügy</Button.Text>
          </Button>
          <Button variant="subtab">
            <Button.Text>Régiók</Button.Text>
          </Button>
          <Button variant="subtab" disabled>
            <Button.Text>Időbevonal</Button.Text>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-slate-400 uppercase text-xs tracking-widest mb-3">
          icon-only · tertiary
        </h3>
        <div className="flex gap-2">
          {sizes.map((s) => (
            <Button key={s} variant="tertiary" size={s} iconOnly>
              <Button.Icon name="gear-fill" />
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-slate-400 uppercase text-xs tracking-widest mb-3">
          icon + text · tertiary
        </h3>
        <div className="flex gap-2">
          <Button variant="tertiary">
            <Button.Icon name="arrow-left" />
            <Button.Text>Vissza</Button.Text>
          </Button>
          <Button variant="tertiary">
            <Button.Icon name="x-lg" />
            <Button.Text>Mégse</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
